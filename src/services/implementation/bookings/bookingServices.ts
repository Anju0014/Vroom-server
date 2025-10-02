
import { IBooking } from '../../../models/booking/bookingModel';
import IBookingRepository from '../../../repositories/interfaces/bookings/IBookingRepository';
import { IBookingService } from '../../interfaces/bookings/IBookingServices';
import { ICar } from '../../../models/car/carModel';
import mongoose from 'mongoose';
import { endOfDay } from 'date-fns';
import generateTrackingToken from '../../../utils/trackingIDGenerator';
import { getIO } from '../../../sockets/socket';
import Stripe from 'stripe';

// Define types used in the service
export interface BookingData {
  carId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  // Add other fields as needed
}

export interface UpdateTrackingProps {
  bookingId: string;
  token: string;
  lat: number;
  lng: number;
}

export class BookingService implements IBookingService {
  private _bookingRepository: IBookingRepository;
  private stripe: Stripe; // Assuming Stripe is initialized elsewhere

  constructor(bookingRepository: IBookingRepository, stripeApiKey: string) {
    this._bookingRepository = bookingRepository;
    this.stripe = new Stripe(stripeApiKey, { apiVersion: '2024-06-20' });
  }

  async listAllBookings(page: number, limit: number, search: string): Promise<{ bookings: IBooking[]; total: number }> {
    if (page < 1 || limit < 1 || limit > 100) throw new Error('Invalid page or limit');
    try {
      return await this._bookingRepository.getAllBookings(page, limit, search);
    } catch (error) {
      console.error('Error in listAllBookings:', error);
      throw new Error('Failed to fetch bookings');
    }
  }

  async getBookingsForCarOwner(carOwnerId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }> {
    if (!carOwnerId) throw new Error('Car owner ID is required');
    if (page < 1 || limit < 1 || limit > 100) throw new Error('Invalid page or limit');
    return await this._bookingRepository.getBookingsForCarOwner(carOwnerId, page, limit);
  }

  async getBookingsByCarId(carId: string, ownerId: string): Promise<IBooking[]> {
    if (!carId || !ownerId) throw new Error('Car ID and owner ID are required');
    return await this._bookingRepository.findByCarId(carId, ownerId);
  }

  async getActiveBookingForCar(carId: string): Promise<IBooking | null> {
    if (!carId) throw new Error('Car ID is required');
    return await this._bookingRepository.findActiveBookingByCarId(carId);
  }

  async getCustomerBookings(userId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }> {
    if (!userId) throw new Error('User ID is required');
    if (page < 1 || limit < 1 || limit > 100) throw new Error('Invalid page or limit');
    return await this._bookingRepository.findBookingsByUserId(userId, page, limit);
  }

  async getCustomerBookingCount(userId: string): Promise<number> {
    if (!userId) throw new Error('User ID is required');
    return await this._bookingRepository.getBookingsCountByUserId(userId);
  }

  async createPendingBooking(bookingData: BookingData): Promise<string> {
    const { carId, customerId, startDate, endDate, totalAmount } = bookingData;
    if (!carId || !customerId || !startDate || !endDate || !totalAmount) {
      throw new Error('Missing required booking fields');
    }

    const car = await this._bookingRepository.findCarById(carId);
    if (!car) throw new Error('Car not found');

    const start = new Date(startDate);
    const end = endOfDay(new Date(endDate));
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format');
    }

    const conflict = await this._bookingRepository.findConflictingBooking(carId, start, end);
    if (conflict) throw new Error('Car is not available for the selected dates');

    const booking = await this._bookingRepository.createBooking({
      carId: new mongoose.Types.ObjectId(carId),
      userId: new mongoose.Types.ObjectId(customerId),
      startDate: start,
      endDate: end,
      totalPrice,
      status: 'pending',
    });

    if (!booking || !booking._id) throw new Error('Error creating the booking');
    return booking._id.toString();
  }

  async confirmBooking(bookingId: string, paymentIntentId: string): Promise<void> {
    if (!bookingId || !paymentIntentId) throw new Error('Booking ID and payment intent ID are required');

    const booking = await this._bookingRepository.findBookingById(bookingId);
    if (!booking || booking.status !== 'pending') throw new Error('Invalid or non-pending booking');

    const newBookingId = await this._bookingRepository.generateBookingId();
    const token = generateTrackingToken();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const trackingUrl = `${frontendUrl}/customer/tracking/${bookingId}?token=${token}`;

    const updatedBooking = {
      ...booking,
      status: 'confirmed',
      paymentIntentId,
      bookingId: newBookingId,
      trackingToken: token,
      trackingUrl,
    };

    await this._bookingRepository.saveBooking(updatedBooking);
  }

  async failedBooking(bookingId: string): Promise<void> {
    if (!bookingId) throw new Error('Booking ID is required');

    const booking = await this._bookingRepository.findBookingById(bookingId);
    if (!booking || booking.status !== 'pending') throw new Error('Invalid or non-pending booking');

    booking.status = 'failed';
    await this._bookingRepository.saveBooking(booking);
  }

  async cancelBooking(bookingId: string): Promise<void> {
    if (!bookingId) throw new Error('Booking ID is required');

    const booking = await this._bookingRepository.findBookingById(bookingId);
    if (!booking || booking.status !== 'confirmed') throw new Error('Invalid or non-confirmed booking');

    const totalAmount = booking.totalPrice;
    const cancellationFeeRate = 0.01;
    const cancellationFee = Math.round(totalAmount * cancellationFeeRate);
    const refundAmount = totalAmount - cancellationFee;

    if (booking.paymentIntentId) {
      const refund = await this.stripe.refunds.create({
        payment_intent: booking.paymentIntentId,
        amount: refundAmount * 100, // Stripe expects cents
      });
      console.log('Refund processed through Stripe:', refund.id);

      await this._bookingRepository.logWalletTransaction(
        booking.userId.toString(),
        'refund',
        refundAmount,
        `Refund for booking cancellation via Stripe`
      );
    }

    let wallet = await this._bookingRepository.findWalletByUserId(booking.userId.toString());
    if (!wallet) {
      console.log('Wallet not found. Creating a new wallet...');
      wallet = await this._bookingRepository.createWallet(booking.userId.toString());
    }

    if (wallet) {
      wallet.balance += refundAmount;
      await this._bookingRepository.saveWallet(wallet);
      await this._bookingRepository.logWalletTransaction(
        booking.userId.toString(),
        'refund',
        refundAmount,
        `Refund added to wallet after cancellation`
      );
    }

    booking.status = 'cancelled';
    booking.cancellationFee = cancellationFee;
    booking.refundedAmount = refundAmount;
    booking.cancelledAt = new Date();
    await this._bookingRepository.saveBooking(booking);
  }

  async updateTrackingLocation({ bookingId, token, lat, lng }: UpdateTrackingProps): Promise<void> {
    if (!bookingId || !token || lat == null || lng == null) throw new Error('Missing required tracking fields');

    const booking = await this._bookingRepository.findBookingById(bookingId);
    if (!booking || booking.trackingToken !== token) throw new Error('Unauthorized tracking link');

    await this._bookingRepository.updateBookingLocation(bookingId, { lat, lng });

    const io = getIO();
    console.log(`Emitting location to booking_${bookingId}:`, { lat, lng });
    io.to(`booking_${bookingId}`).emit('location:update', { lat, lng });
  }
}

export default BookingService;