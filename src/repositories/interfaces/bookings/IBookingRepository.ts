import { IBooking } from '../../../models/booking/bookingModel';
import { ICar } from '../../../models/car/carModel';

interface Wallet {
  userId: string;
  balance: number;
  // Add other wallet fields
}

export default interface IBookingRepository {
  getAllBookings(page: number, limit: number, search: string): Promise<{ bookings: IBooking[]; total: number }>;
  getBookingsForCarOwner(carOwnerId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }>;
  findByCarId(carId: string, ownerId: string): Promise<IBooking[]>;
  findActiveBookingByCarId(carId: string): Promise<IBooking | null>;
  findBookingsByUserId(userId: string, page: number, limit: number): Promise<{ bookings: IBooking[]; total: number }>;
  getBookingsCountByUserId(userId: string): Promise<number>;
  findCarById(carId: string): Promise<ICar | null>;
  findConflictingBooking(carId: string, start: Date, end: Date): Promise<IBooking | null>;
  createBooking(bookingData: Partial<IBooking>): Promise<IBooking>;
  findBookingById(bookingId: string): Promise<IBooking | null>;
  generateBookingId(): Promise<string>;
  saveBooking(booking: IBooking): Promise<IBooking>;
  updateBookingLocation(bookingId: string, location: { lat: number; lng: number }): Promise<void>;
  findWalletByUserId(userId: string): Promise<Wallet | null>;
  createWallet(userId: string): Promise<Wallet>;
  saveWallet(wallet: Wallet): Promise<Wallet>;
  logWalletTransaction(userId: string, type: string, amount: number, description: string): Promise<void>;
}