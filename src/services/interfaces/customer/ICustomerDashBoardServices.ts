import { IBooking } from '../../../models/booking/bookingModel';

export interface ICustomerDashBoardService {
  getCustomerBookings(userId: string, page: number, limit: number): Promise<any>;
  getCustomerBookingCount(userId: string): Promise<number>;
  cancelBooking(bookingId: string): Promise<IBooking>;
}
