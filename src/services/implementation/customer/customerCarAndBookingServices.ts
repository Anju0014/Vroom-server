import ICustomerCarAndBookingRepository from '../../../repositories/interfaces/customer/ICustomerCarAndBookingRepository';
import { ICustomerCarAndBookingService } from '../../interfaces/customer/ICustomerCarAndBookingServices';
import { Car, ICar } from '../../../models/car/carModel';
import { BookingData, UpdateTrackingProps } from '../../../types/bookingData';
import mongoose from 'mongoose';
import generateTrackingToken from '../../../utils/trackingIDGenerator';
import { getIO } from '../../../sockets/socket';
import { endOfDay } from 'date-fns';

import { Booking, IBooking } from '../../../models/booking/bookingModel';
import { NotificationTemplates } from '../../../templates/notificationTemplates';
import INotificationRepository from '../../../repositories/interfaces/notification/INotificationRepository';
import { INotificationService } from '../../interfaces/notification/INotificationServices';

class CustomerCarAndBookingService implements ICustomerCarAndBookingService {
  private _customerCarRepository: ICustomerCarAndBookingRepository;
  private _notificationService: INotificationService;

  constructor(
    customerCarRepository: ICustomerCarAndBookingRepository,
    notificationService: INotificationService
  ) {
    this._customerCarRepository = customerCarRepository;
    this._notificationService = notificationService;
  }

  async getNearbyCars(lat: number, lng: number, maxDistance: number): Promise<ICar[]> {
    return this._customerCarRepository.findNearbyCars(lat, lng, maxDistance);
  }

  async getFeaturedCars(): Promise<ICar[]> {
    return this._customerCarRepository.findFeaturedCars();
  }

  async getCarDetail(carId: string): Promise<ICar | null> {
    return this._customerCarRepository.findCarById(carId);
  }

  async getBookedDateRanges(carId: string): Promise<{ start: Date; end: Date }[]> {
    return this._customerCarRepository.findBookedDates(carId);
  }

  async getAllCars(
    page: number,
    limit: number,
    filters: {
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      carType?: string;
      location?: string;
      startDate: string;
      endDate: string;
      // latitude?: number;
      // longitude?: number;
    }
  ): Promise<ICar[]> {
    return this._customerCarRepository.getAllCars(page, limit, filters);
  }

  async getCarsCount(filters: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    carType?: string;
    location?: string;
    startDate: string;
    endDate: string;
    // latitude?: number;
    // longitude?: number;
  }): Promise<number> {
    return this._customerCarRepository.getCarsCount(filters);
  }

  async createPendingBooking(bookingData: BookingData): Promise<string> {
    const { carId, startDate, endDate, userId } = bookingData;

    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    const car = await this._customerCarRepository.findCarById(carId);
    if (!car) {
      throw new Error('Car not found');
    }

    const start = new Date(startDate);
    const end = endOfDay(new Date(endDate));

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format');
    }

    const conflict = await this._customerCarRepository.findConflictingBooking(carId, start, end);
    if (conflict && conflict.userId.toString() !== userId) {
      throw new Error('Car is not available for the selected dates');
    }

    const existingBooking = await this._customerCarRepository.checkOldBooking({
      carId,
      userId,
      startDate: start,
      endDate: end,
    });

    const now = new Date();
    const lockDuration = 10 * 60 * 1000;

    if (existingBooking && existingBooking.lockedUntil && existingBooking?.lockedUntil > now) {
      existingBooking.lockedUntil = new Date(now.getTime() + lockDuration);
      await existingBooking.save();
      if (!existingBooking._id) {
        throw new Error(' Error in retreiving the old Booking');
      }
      return existingBooking._id.toString();
    }

    const booking = await this._customerCarRepository.createBooking({
      ...bookingData,
      startDate: start,
      endDate: end,
      status: 'pending',
      lockedUntil: new Date(now.getTime() + lockDuration),
    });

    if (!booking || !booking._id) {
      throw new Error('Error creating the booking');
    }
    return booking._id.toString();
  }

  //       async createPendingBooking(bookingData: BookingData): Promise<string> {
  //   const { carId, startDate, endDate } = bookingData;

  //   if (!startDate || !endDate) {
  //     throw new Error('Start date and end date are required');
  //   }

  //   const car = await this._customerCarRepository.findCarById(carId);
  //   if (!car) {
  //     throw new Error('Car not found');
  //   }

  //   const start = new Date(startDate);
  //   const end = endOfDay(new Date(endDate));

  //   if (isNaN(start.getTime()) || isNaN(end.getTime())) {
  //     throw new Error('Invalid date format');
  //   }

  //   const conflict = await this._customerCarRepository.findConflictingBooking(carId,start,end);
  //   if (conflict) {
  //     throw new Error('Car is not available for the selected dates');
  //   }

  //   console.log("conflict",conflict)

  // //   const existingBooking = await  this._customerCarRepository.checkOldBooking(bookingData)

  // //   if (existingBooking &&  existingBooking._id) {
  // //     console.log("existingone")
  // //     return  existingBooking._id.toString() ;
  // //   }

  // console.log("create pending booking phase1")
  // const now = new Date();
  // const lockDuration = 10 * 60 * 1000; // 10 minutes
  //   const booking = await this._customerCarRepository.createBooking({
  //     ...bookingData,
  //     startDate: start,
  //     endDate: end,
  //     status: 'pending',
  //     lockedUntil: new Date(now.getTime() + lockDuration),

  //   });

  // console.log("booking new pending",booking);
  //   if(!booking || !booking._id){
  //     throw new Error(' Error in Creating the Booking')
  //   }
  //   return booking._id.toString();
  // }

  async confirmBooking(bookingId: string, paymentIntentId: string): Promise<IBooking> {
    const booking = await this._customerCarRepository.findBookingById(bookingId);
    console.log('booking-old-confirm', booking);
    if (!booking || booking.status !== 'agreementAccepted') {
      throw new Error('Invalid or non-pending booking');
    }

    booking.status = 'confirmed';
    booking.paymentIntentId = paymentIntentId;
    const newBookingId = await this._customerCarRepository.generateBookingId();
    booking.bookingId = newBookingId;

    console.log('old -confirm???', booking);
    const newbooking = await this._customerCarRepository.saveBooking(booking);
    console.log('newbooking-confirm', newbooking);
    const token = generateTrackingToken();
    const frontendUrl = process.env.FRONTEND_URL;
    const trackingUrl = `${frontendUrl}/customer/tracking/${bookingId}?token=${token}`;
    booking.trackingToken = token;
    booking.trackingUrl = trackingUrl;

    const updatedBooking = await this._customerCarRepository.saveBooking(booking);
    const car = await Car.findById(booking.carId);
    const carModel = car?.carName ?? 'Car';

    const notification = await this._notificationService.create(
      NotificationTemplates.bookingConfirmed(
        booking.carOwnerId.toString(),
        bookingId,
        carModel,
        booking.startDate,
        booking.endDate
      )
    );
    //   const io = getIO();
    // io.to(booking.carOwnerId.toString()).emit("newNotification", notification);
    return updatedBooking;
  }

  async failedBooking(bookingId: string): Promise<void> {
    const booking = await this._customerCarRepository.findBookingById(bookingId);
    if (!booking || booking.status !== 'pending') {
      throw new Error('Invalid or non-pending booking');
    }

    // Option 1: update status
    booking.status = 'failed';
    await this._customerCarRepository.saveBooking(booking);
  }

  // async updateTrackingLocation({bookingId,token,lat,lng,}: UpdateTrackingProps): Promise<void> {
  //   const booking = await this._customerCarRepository.findBookingById(bookingId);
  //   console.log(booking)

  //   if (!booking || booking.trackingToken !== token) {
  //     throw new Error("Unauthorized tracking link");
  //   }

  //   await this._customerCarRepository.updateBookingLocation(bookingId, { lat, lng });

  //   const io = getIO();
  //   console.log(`Emitting location to booking_${bookingId}:`, { lat, lng });
  //   io.to(`booking_${bookingId}`).emit("location:update", { lat, lng });
  // }

  async updateTrackingLocation({ bookingId, token, lat, lng }: UpdateTrackingProps): Promise<void> {
    console.log('Updating location for booking:', bookingId, { lat, lng });
    const booking = await this._customerCarRepository.findBookingById(bookingId);
    console.log('Booking found:', booking);

    if (!booking || booking.trackingToken !== token) {
      console.error('Unauthorized tracking link for booking:', bookingId);
      throw new Error('Unauthorized tracking link');
    }

    await this._customerCarRepository.updateBookingLocation(bookingId, { lat, lng });
    console.log('Location updated in DB for booking:', bookingId);

    const io = getIO();
    console.log(`Emitting location to booking_${bookingId}:`, { lat, lng });
    io.to(`booking_${bookingId}`).emit('location:update', { lat, lng });
  }
}
export default CustomerCarAndBookingService;
