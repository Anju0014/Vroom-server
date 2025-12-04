import { IBooking } from '../../../models/booking/bookingModel';
import { ICar } from '../../../models/car/carModel';
import { ICarOwner } from '../../../models/carowner/carOwnerModel';
import { BookingData } from '../../../types/bookingData';

export interface ICustomerDashBoardService {
  getCustomerBookings(userId: string, page: number, limit: number): Promise<any>;
  getCustomerBookingCount(userId: string): Promise<number>;
  cancelBooking(bookingId: string): Promise<IBooking>;
}
