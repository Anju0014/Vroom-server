import { IBooking } from '../../../models/booking/bookingModel';
import { ICar } from '../../../models/car/carModel';
import IBookingRepository from '../../interfaces/bookings/IBookingRepository';
import { BaseRepository } from '../../base/BaseRepository';
import { Booking } from '../../../models/booking/bookingModel';
import { Car } from '../../../models/car/carModel';
import { Customer } from '../../../models/customer/customerModel';
import { CarOwner } from '../../../models/carowner/carOwnerModel';
import { Wallet, IWallet } from '../../../models/wallet/walletModel'; // Assumed model
import { Counter } from '../../../models/counter/counterModel';
import { Types, PipelineStage, HydratedDocument } from 'mongoose';
import { startOfDay, endOfDay } from 'date-fns';

interface Wallet {
  _id: Types.ObjectId;
  userId: string;
  balance: number;
  transactions: { type: string; amount: number; description: string; createdAt: Date }[];
}

export class BookingRepository extends BaseRepository<IBooking> implements IBookingRepository {
  constructor() {
    super(Booking);
  }

  async getAllBookings(page: number, limit: number, search: string): Promise<{ bookings: IBooking[]; total: number }> {
    try {
      if (page < 1 || limit < 1 || limit > 100) throw new Error('Invalid page or limit');

      const match: any = { status: { $in: ['confirmed', 'cancelled'] } };
      if (search) {
        const regex = new RegExp(search, 'i');
        match.$or = [
          { bookingId: regex },
          { 'customer.fullName': regex },
          { 'carOwner.fullName': regex },
          { 'car.carName': regex },
          { status: regex },
        ];
      }

      const pipeline: PipelineStage[] = [
        {
          $lookup: {
            from: 'customers',
            localField: 'customerId',
            foreignField: '_id',
            as: 'customer',
          },
        },
        { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'carowners',
            localField: 'carOwnerId',
            foreignField: '_id',
            as: 'carOwner',
          },
        },
        { $unwind: { path: '$carOwner', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'cars',
            localField: 'carId',
            foreignField: '_id',
            as: 'car',
          },
        },
        { $unwind: { path: '$car', preserveNullAndEmptyArrays: true } },
        { $match: match },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $project: {
            customer: { _id: 1, fullName: 1, email: 1 },
            carOwner: { _id: 1, fullName: 1, email: 1, phone: 1 },
            car: { _id: 1, carName: 1, brand: 1, model: 1, 'location.address': 1, rcBookNo: 1 },
            bookingId: 1,
            carId: 1,
            customerId: 1,
            carOwnerId: 1,
            startDate: 1,
            endDate: 1,
            status: 1,
            totalAmount: 1,
            paymentIntentId: 1,
            trackingToken: 1,
            trackingUrl: 1,
            cancellationFee: 1,
            refundedAmount: 1,
            cancelledAt: 1,
            tracking: 1,
            createdAt: 1,
          },
        },
      ];

      const bookings = await Booking.aggregate(pipeline).exec();
      const totalPipeline = [...pipeline.slice(0, -3), { $count: 'total' }]; // Remove skip, limit, project
      const totalResult = await Booking.aggregate(totalPipeline).exec();

      return { bookings, total: totalResult[0]?.total || 0 };
    } catch (error) {
      console.error('Error in getAllBookings:', error);
      throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBookingsForCarOwner(carOwnerId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }> {
    try {
      if (!Types.ObjectId.isValid(carOwnerId)) throw new Error('Invalid car owner ID');
      if (page < 1 || limit < 1 || limit > 100) throw new Error('Invalid page or limit');

      const query = {
        carOwnerId: new Types.ObjectId(carOwnerId),
        status: { $in: ['confirmed', 'cancelled'] },
      };

      const total = await Booking.countDocuments(query).exec();
      const bookings = await Booking.find(query)
        .populate({ path: 'customerId', select: '_id fullName email' })
        .populate({ path: 'carId', select: '_id carName brand model location.address rcBookNo' })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      return { bookings, total };
    } catch (error) {
      console.error('Error in getBookingsForCarOwner:', error);
      throw new Error(`Failed to fetch bookings for car owner ${carOwnerId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByCarId(carId: string, ownerId: string): Promise<IBooking[]> {
    try {
      if (!Types.ObjectId.isValid(carId) || !Types.ObjectId.isValid(ownerId)) {
        throw new Error('Invalid car ID or owner ID');
      }
      const car = await Car.findOne({ _id: carId, owner: ownerId, isDeleted: false }).exec();
      if (!car) throw new Error('Car not found or not owned by user');
      return await Booking.find({ carId: new Types.ObjectId(carId) })
        .populate({ path: 'customerId', select: '_id fullName email' })
        .populate({ path: 'carId', select: '_id carName brand model location.address rcBookNo' })
        .exec();
    } catch (error) {
      console.error('Error in findByCarId:', error);
      throw new Error(`Failed to fetch bookings for car ${carId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findActiveBookingByCarId(carId: string): Promise<IBooking | null> {
    try {
      if (!Types.ObjectId.isValid(carId)) throw new Error('Invalid car ID');
      const today = new Date();
      const start = startOfDay(today);
      const end = endOfDay(today);
      return await Booking.findOne({
        carId: new Types.ObjectId(carId),
        status: 'confirmed',
        startDate: { $lte: end },
        endDate: { $gte: start },
      })
        .populate({ path: 'customerId', select: '_id fullName email' })
        .populate({ path: 'carId', select: '_id carName brand model location.address rcBookNo' })
        .exec();
    } catch (error) {
      console.error('Error in findActiveBookingByCarId:', error);
      throw new Error(`Failed to find active booking for car ${carId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findBookingsByUserId(userId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }> {
    try {
      if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid customer ID');
      if (page < 1 || limit < 1 || limit > 100) throw new Error('Invalid page or limit');

      const query = { customerId: new Types.ObjectId(userId) };
      const total = await Booking.countDocuments(query).exec();
      const bookings = await Booking.find(query)
        .populate({
          path: 'carId',
          select: '_id carName brand model location.address rcBookNo',
        })
        .populate({
          path: 'carOwnerId',
          select: '_id fullName phone email',
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      return { bookings, total };
    } catch (error) {
      console.error('Error in findBookingsByUserId:', error);
      throw new Error(`Failed to fetch bookings for customer ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBookingsCountByUserId(userId: string): Promise<number> {
    try {
      if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid customer ID');
      const count = await Booking.countDocuments({ customerId: new Types.ObjectId(userId) }).exec();
      console.log('Total bookings count for customer:', count);
      return count;
    } catch (error) {
      console.error('Error in getBookingsCountByUserId:', error);
      throw new Error(`Failed to count bookings for customer ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findCarById(carId: string): Promise<ICar | null> {
    try {
      if (!Types.ObjectId.isValid(carId)) throw new Error('Invalid car ID');
      return await Car.findById(carId).exec();
    } catch (error) {
      console.error('Error in findCarById:', error);
      throw new Error(`Failed to find car ${carId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findConflictingBooking(carId: string, startDate: Date, endDate: Date): Promise<IBooking | null> {
    try {
      if (!Types.ObjectId.isValid(carId)) throw new Error('Invalid car ID');
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) throw new Error('Invalid date format');
      return await Booking.findOne({
        carId: new Types.ObjectId(carId),
        status: { $in: ['confirmed', 'pending'] },
        $or: [
          { startDate: { $lte: endDate, $gte: startDate } },
          { endDate: { $lte: endDate, $gte: startDate } },
          { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
        ],
      }).exec();
    } catch (error) {
      console.error('Error in findConflictingBooking:', error);
      throw new Error(`Failed to check conflicting bookings for car ${carId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createBooking(bookingData: Partial<IBooking>): Promise<IBooking> {
    try {
      if (!bookingData.carId || !bookingData.userId || !bookingData.startDate || !bookingData.endDate || !bookingData.totalPrice) {
        throw new Error('Missing required booking fields');
      }
      return await Booking.create(bookingData);
    } catch (error) {
      console.error('Error in createBooking:', error);
      throw new Error(`Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findBookingById(bookingId: string): Promise<IBooking | null> {
    try {
      if (!Types.ObjectId.isValid(bookingId)) throw new Error('Invalid booking ID');
      return await Booking.findById(bookingId)
        .populate({ path: 'carId', select: '_id carName brand model location.address rcBookNo' })
        .populate({ path: 'carOwnerId', select: '_id fullName phone email' })
        .exec();
    } catch (error) {
      console.error('Error in findBookingById:', error);
      throw new Error(`Failed to find booking ${bookingId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateBookingId(): Promise<string> {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: 'bookingId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      ).exec();
      const paddedSeq = counter.seq.toString().padStart(4, '0');
      return `VROOM-RIDE-${paddedSeq}`;
    } catch (error) {
      console.error('Error in generateBookingId:', error);
      throw new Error(`Failed to generate booking ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveBooking(booking: HydratedDocument<IBooking>): Promise<IBooking> {
    try {
      const savedBooking = await booking.save();
      console.log('Booking saved:', savedBooking._id);
      return savedBooking;
    } catch (error) {
      console.error('Error in saveBooking:', error);
      throw new Error(`Failed to save booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateBookingLocation(bookingId: string, location: { lat: number; lng: number }): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(bookingId)) throw new Error('Invalid booking ID');
      if (isNaN(location.lat) || isNaN(location.lng)) throw new Error('Invalid location coordinates');
      await Booking.findByIdAndUpdate(bookingId, { $set: { tracking: location } }, { new: true }).exec();
    } catch (error) {
      console.error('Error in updateBookingLocation:', error);
      throw new Error(`Failed to update booking location for ${bookingId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findWalletByUserId(userId: string): Promise<Wallet | null> {
    try {
      if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid customer ID');
      return await Wallet.findOne({ userId }).exec();
    } catch (error) {
      console.error('Error in findWalletByUserId:', error);
      throw new Error(`Failed to find wallet for customer ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createWallet(userId: string): Promise<Wallet> {
    try {
      if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid customer ID');
      const wallet = await Wallet.create({ userId, balance: 0, transactions: [] });
      console.log('Wallet created for customer:', userId);
      return wallet;
    } catch (error) {
      console.error('Error in createWallet:', error);
      throw new Error(`Failed to create wallet for customer ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveWallet(wallet: Wallet): Promise<Wallet> {
    try {
      const updatedWallet = await Wallet.findOneAndUpdate(
        { userId: wallet.userId },
        { $set: { balance: wallet.balance, transactions: wallet.transactions } },
        { new: true }
      ).exec();
      if (!updatedWallet) throw new Error('Wallet not found');
      console.log('Wallet updated for customer:', wallet.userId);
      return updatedWallet;
    } catch (error) {
      console.error('Error in saveWallet:', error);
      throw new Error(`Failed to save wallet for customer ${wallet.userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async logWalletTransaction(userId: string, type: string, amount: number, description: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid customer ID');
      if (!type || isNaN(amount)) throw new Error('Invalid transaction type or amount');
      await Wallet.updateOne(
        { userId },
        {
          $push: {
            transactions: {
              type,
              amount,
              description,
              createdAt: new Date(),
            },
          },
        }
      ).exec();
      console.log('Transaction logged for customer:', userId, { type, amount, description });
    } catch (error) {
      console.error('Error in logWalletTransaction:', error);
      throw new Error(`Failed to log wallet transaction for customer ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findBookedDates(carId: string): Promise<{ start: Date; end: Date }[]> {
    try {
      if (!Types.ObjectId.isValid(carId)) throw new Error('Invalid car ID');
      const bookings = await Booking.find({
        carId: new Types.ObjectId(carId),
        status: { $in: ['confirmed', 'pending'] },
      })
        .select('startDate endDate')
        .exec();
      return bookings.map((b) => ({
        start: startOfDay(b.startDate),
        end: endOfDay(b.endDate),
      }));
    } catch (error) {
      console.error('Error in findBookedDates:', error);
      throw new Error(`Failed to find booked dates for car ${carId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default BookingRepository;