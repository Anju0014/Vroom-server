import { IBooking } from '../../../models/booking/bookingModel';
import { BookingData, UpdateTrackingProps } from './BookingService';

export interface IBookingService {
  listAllBookings(page: number, limit: number, search: string): Promise<{ bookings: IBooking[]; total: number }>;
  getBookingsForCarOwner(carOwnerId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }>;
  getBookingsByCarId(carId: string, ownerId: string): Promise<IBooking[]>;
  getActiveBookingForCar(carId: string): Promise<IBooking | null>;
  getCustomerBookings(userId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }>;
  getCustomerBookingCount(userId: string): Promise<number>;
  createPendingBooking(bookingData: BookingData): Promise<string>;
  confirmBooking(bookingId: string, paymentIntentId: string): Promise<void>;
  failedBooking(bookingId: string): Promise<void>;
  cancelBooking(bookingId: string): Promise<void>;
  updateTrackingLocation(props: UpdateTrackingProps): Promise<void>;
}