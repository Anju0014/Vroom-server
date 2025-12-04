import { ICarOwnerBookingService } from '../../interfaces/carOwner/ICarOwnerBookingServices';

import ICarOwnerBookingRepository from '../../../repositories/interfaces/carOwner/ICarOwnerBookingRepository';

import { IBooking } from '../../../models/booking/bookingModel';

class CarOwnerBookingService implements ICarOwnerBookingService {
  private _ownersBookingRepository: ICarOwnerBookingRepository;

  constructor(ownerBookingRepository: ICarOwnerBookingRepository) {
    this._ownersBookingRepository = ownerBookingRepository;
  }

  async getBookingsForCarOwner(
    carOwnerId: string,
    page: number,
    limit: number
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const { bookings, total } = await this._ownersBookingRepository.getBookingsForCarOwner(
      carOwnerId,
      page,
      limit
    );
    return { bookings, total };
  }
}
export default CarOwnerBookingService;
