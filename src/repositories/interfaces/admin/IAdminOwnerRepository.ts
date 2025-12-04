import { ICar } from '../../../models/car/carModel';
import { ICarOwner } from '../../../models/carowner/carOwnerModel';
import { IBooking } from '../../../models/booking/bookingModel';

interface IAdminOwnerRepository {
  getAllOwnerforVerify(
    page: number,
    limit: number,
    search: string
  ): Promise<{ carOwners: ICarOwner[]; total: number }>;
  getAllCarsforVerify(
    page: number,
    limit: number,
    search: string
  ): Promise<{ cars: ICar[]; total: number }>;
  findCarOwnerById(ownerId: string): Promise<ICarOwner | null>;
  updateOwnerStatus(ownerId: string, updateData: Partial<ICarOwner>): Promise<ICarOwner | null>;
  findCarById(carId: string): Promise<ICar | null>;
  updateCarStatus(carId: string, verifyDetails: Partial<ICar>): Promise<ICar | null>;
  getAllVerifiedCars(
    page: number,
    limit: number,
    search: string
  ): Promise<{ cars: ICar[]; total: number }>;
  getAllBookings(
    page: number,
    limit: number,
    search: string
  ): Promise<{ bookings: IBooking[]; total: number }>;
}

export default IAdminOwnerRepository;
