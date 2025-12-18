// import { ICarOwner } from '../../../models/carowner/carOwnerModel';
// import { ICar } from '../../../models/car/carModel';
// import { IBooking } from '../../../models/booking/bookingModel';

// export interface IAdminOwnerService {
//   listAllOwnerforVerify(
//     page: number,
//     limit: number,
//     search: string
//   ): Promise<{ carOwners: ICarOwner[]; total: number }>;
//   listAllCarsforVerify(
//     page: number,
//     limit: number,
//     search: string
//   ): Promise<{ cars: ICar[]; total: number }>;
//   listAllVerifiedCars(
//     page: number,
//     limit: number,
//     search: string
//   ): Promise<{ cars: ICar[]; total: number }>;
//   listAllBookings(
//     page: number,
//     limit: number,
//     search: string
//   ): Promise<{ bookings: IBooking[]; total: number }>;

//   updateOwnerVerifyStatus(
//     ownerId: string,
//     verifyDetails: Partial<ICarOwner>
//   ): Promise<ICarOwner | null>;
//   updateOwnerBlockStatus(ownerId: string, newStatus: number): Promise<ICarOwner | null>;
//   updateCarBlockStatus(carId: string, newStatus: number): Promise<ICar | null>;
//   updateCarVerifyStatus(carId: string, verifyDetails: Partial<ICar>): Promise<ICar | null>;
// }

import {
  OwnerVerifyListItemDTO,
  OwnerVerifyListResponseDTO,
} from '../../../dtos/adminOwner/carOwnerVerifyList.response.dto';
import {
  CarVerifyListItemDTO,
  CarVerifyListResponseDTO,
} from '../../../dtos/adminOwner/carVerifyList.response.dto';
import { BookingListResponseDTO } from '../../../dtos/adminOwner/bookingList.response.dto';
import { UpdateOwnerVerifyStatusRequestDTO } from '../../../dtos/adminOwner/ownerStatusUpdate.response.dto';
import { UpdateCarVerifyStatusRequestDTO } from '../../../dtos/adminOwner/carStatusUpdate.request.dto';

export interface IAdminOwnerService {
  listAllOwnerforVerify(
    page: number,
    limit: number,
    search: string
  ): Promise<OwnerVerifyListResponseDTO>;

  listAllCarsforVerify(
    page: number,
    limit: number,
    search: string
  ): Promise<CarVerifyListResponseDTO>;

  listAllVerifiedCars(
    page: number,
    limit: number,
    search: string
  ): Promise<CarVerifyListResponseDTO>;

  listAllBookings(page: number, limit: number, search: string): Promise<BookingListResponseDTO>;

  updateOwnerVerifyStatus(
    ownerId: string,
    data: UpdateOwnerVerifyStatusRequestDTO
  ): Promise<OwnerVerifyListItemDTO>;

  updateOwnerBlockStatus(ownerId: string, blockStatus: number): Promise<OwnerVerifyListItemDTO>;

  updateCarVerifyStatus(
    carId: string,
    data: UpdateCarVerifyStatusRequestDTO
  ): Promise<CarVerifyListItemDTO>;

  updateCarBlockStatus(carId: string, blockStatus: number): Promise<CarVerifyListItemDTO>;
}
