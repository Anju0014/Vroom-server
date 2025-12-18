import ICarOwnerBookingRepository from '../../interfaces/carOwner/ICarOwnerBookingRepository';
import { BaseRepository } from '../../base/BaseRepository';
import { Car, ICar } from '../../../models/car/carModel';
import { Booking, IBooking } from '../../../models/booking/bookingModel';

class CarOwnerBookingRepository extends BaseRepository<ICar> implements ICarOwnerBookingRepository {
  constructor() {
    super(Car);
  }

  async getBookingsForCarOwner(
    carOwnerId: string,
    page: number,
    limit: number
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const query = {
      carOwnerId: carOwnerId,
      status: { $in: ['confirmed', 'cancelled'] },
    };

    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate({
        path: 'userId',
        select: '_id fullName email',
      })
      .populate({
        path: 'carId',
        select: '_id carName brand model',
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { bookings, total };
  }
}
export default CarOwnerBookingRepository;
