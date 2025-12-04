import { ICar } from '../../../models/car/carModel';
import { IBooking } from '../../../models/booking/bookingModel';

export interface ICarOwnerBookingService {
  getBookingsForCarOwner(
    carOwnerId: string,
    page: number,
    limit: number
  ): Promise<{ bookings: IBooking[]; total: number }>;
}
