import { IBooking } from '../../../models/booking/bookingModel';

interface ICarOwnerBookingRepository {
  getBookingsForCarOwner(
    carOwnerId: string,
    page: number,
    limit: number
  ): Promise<{ bookings: IBooking[]; total: number }>;
}
export default ICarOwnerBookingRepository;
