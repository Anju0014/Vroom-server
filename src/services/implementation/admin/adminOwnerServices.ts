import IAdminOwnerRepository from '../../../repositories/interfaces/admin/IAdminOwnerRepository';
import { IAdminOwnerService } from '../../interfaces/admin/IAdminOwnerServices';

import { ICarOwner } from '../../../models/carowner/carOwnerModel';
import { sendEmail } from '../../../utils/emailconfirm';
import { ICar } from '../../../models/car/carModel';

import {
  carVerificationRejectedTemplate,
  verificationApprovedTemplate,
  verificationRejectedTemplate,
} from '../../../templates/emailTemplates';

import {
  OwnerVerifyListItemDTO,
  OwnerVerifyListResponseDTO,
} from '../../../dtos/adminOwner/carOwnerVerifyList.response.dto';
import {
  CarVerifyListItemDTO,
  CarVerifyListResponseDTO,
} from '../../../dtos/adminOwner/carVerifyList.response.dto';
import { BookingListResponseDTO } from '../../../dtos/adminOwner/bookingList.response.dto';
import { AdminOwnerMapper } from '../../../mappers/adminOwner.mapper';
import logger from '../../../utils/logger';

class AdminOwnerService implements IAdminOwnerService {
  private _adminOwnerRepository: IAdminOwnerRepository;

  constructor(adminOwnerRepository: IAdminOwnerRepository) {
    this._adminOwnerRepository = adminOwnerRepository;
  }

  async listAllOwnerforVerify(
    page: number,
    limit: number,
    search: string
  ): Promise<OwnerVerifyListResponseDTO> {
    try {
      const { carOwners, total } = await this._adminOwnerRepository.getAllOwnerforVerify(
        page,
        limit,
        search
      );

      return {
        carOwners: carOwners.map(AdminOwnerMapper.toOwnerVerifyDTO),
        total,
      };
      // return await this._adminOwnerRepository.getAllOwnerforVerify(page, limit, search);
    } catch (error) {
      logger.error('Error in listAllCustomers:', error);
      throw new Error('Failed to fetch customers');
    }
  }

  async listAllCarsforVerify(
    page: number,
    limit: number,
    search: string
  ): Promise<CarVerifyListResponseDTO> {
    try {
      logger.info('reached222');
      const { cars, total } = await this._adminOwnerRepository.getAllCarsforVerify(
        page,
        limit,
        search
      );
      // return await this._adminOwnerRepository.getAllCarsforVerify(page, limit, search);
      return {
        cars: cars.map(AdminOwnerMapper.toCarVerifyDTO),
        total,
      };
    } catch (error) {
      logger.error('Error in listAllCustomers:', error);
      throw new Error('Failed to fetch customers');
    }
  }

  async listAllVerifiedCars(
    page: number,
    limit: number,
    search: string
  ): Promise<CarVerifyListResponseDTO> {
    try {
      const { cars, total } = await this._adminOwnerRepository.getAllVerifiedCars(
        page,
        limit,
        search
      );
      // return await this._adminOwnerRepository.getAllCarsforVerify(page, limit, search);
      return {
        cars: cars.map(AdminOwnerMapper.toCarVerifyDTO),
        total,
      };
      // return await this._adminOwnerRepository.getAllVerifiedCars(page, limit, search);
    } catch (error) {
      logger.error('Error in listAllCustomers:', error);
      throw new Error('Failed to fetch customers');
    }
  }

  async listAllBookings(
    page: number,
    limit: number,
    search: string
  ): Promise<BookingListResponseDTO> {
    try {
      const { bookings, total } = await this._adminOwnerRepository.getAllBookings(
        page,
        limit,
        search
      );

      return {
        bookings: bookings.map(AdminOwnerMapper.toBookingDTO),
        total,
      };
      // return await this._adminOwnerRepository.getAllBookings(page, limit, search);
    } catch (error) {
      logger.error('Error in listAllBookings:', error);
      throw new Error('Failed to fetch bookings');
    }
  }

  async updateOwnerVerifyStatus(
    ownerId: string,
    verifyDetails: Partial<ICarOwner>
  ): Promise<OwnerVerifyListItemDTO> {
    const { verifyStatus, rejectionReason } = verifyDetails;
    if (verifyStatus === -1 && !rejectionReason) {
      throw new Error('Reason is required when rejecting');
    }
    const user = await this._adminOwnerRepository.findCarOwnerById(ownerId);
    logger.warn('poskook user not found');
    if (!user) {
      logger.warn('poskook user not found');
      throw new Error(' User Not Found');
    }
    let updatedUser = await this._adminOwnerRepository.updateOwnerStatus(ownerId, verifyDetails);
    logger.info('pknns', updatedUser);
    if (!updatedUser) {
      throw new Error('Error in updating the status');
    }
    logger.info('useremail ', updatedUser.email);
    if (verifyStatus === -1) {
      const emailContent = verificationRejectedTemplate(updatedUser.fullName, rejectionReason);
      await sendEmail({ to: updatedUser.email, ...emailContent });
    } else if (verifyStatus === 1) {
      const emailContent = verificationApprovedTemplate(updatedUser.fullName);
      await sendEmail({ to: updatedUser.email, ...emailContent });
    }

    logger.info('message');
    return AdminOwnerMapper.toOwnerVerifyDTO(updatedUser);
    // return updatedUser;
  }

  async updateOwnerBlockStatus(
    ownerId: string,
    newStatus: number
  ): Promise<OwnerVerifyListItemDTO> {
    logger.info('Processing status update:', ownerId, newStatus);
    const user = await this._adminOwnerRepository.findCarOwnerById(ownerId);
    if (!user) throw new Error('User not found');
    // let updateData: Partial<ICarOwner> = { blockStatus: newStatus };
    // return await this._adminOwnerRepository.updateOwnerStatus(ownerId, updateData);
    const updatedOwner = await this._adminOwnerRepository.updateOwnerStatus(ownerId, {
      blockStatus: newStatus,
    });

    if (!updatedOwner) throw new Error('Error updating owner block status');

    return AdminOwnerMapper.toOwnerVerifyDTO(updatedOwner);
  }

  async updateCarBlockStatus(carId: string, newStatus: number): Promise<CarVerifyListItemDTO> {
    logger.info('Processing status update:', carId, newStatus);
    const car = await this._adminOwnerRepository.findCarById(carId);
    if (!car) throw new Error('Car not found');
    // let updateData: Partial<ICar> = { blockStatus: newStatus };
    // return await this._adminOwnerRepository.updateCarStatus(carId, updateData);
    const updatedCar = await this._adminOwnerRepository.updateCarStatus(carId, {
      blockStatus: newStatus,
    });

    if (!updatedCar) throw new Error('Error updating car block status');

    return AdminOwnerMapper.toCarVerifyDTO(updatedCar);
  }

  async updateCarVerifyStatus(
    carId: string,
    verifyDetails: Partial<ICar>
  ): Promise<CarVerifyListItemDTO> {
    const { verifyStatus, rejectionReason } = verifyDetails;

    if (verifyStatus === -1 && !rejectionReason) {
      throw new Error('Reason is required when rejecting');
    }

    const car = await this._adminOwnerRepository.findCarById(carId);
    if (!car) {
      throw new Error('Car not found');
    }
    if (car.verifyStatus !== 0) {
      throw new Error('Car has already Verified. Please try Later');
    }
    const updatedCar = await this._adminOwnerRepository.updateCarStatus(carId, verifyDetails);
    if (!updatedCar) {
      throw new Error('Error updating car status');
    }

    if (verifyStatus === -1) {
      const updatedUser = await this._adminOwnerRepository.findCarOwnerById(
        String(updatedCar.owner)
      );
      if (!updatedUser) {
        throw new Error('Car owner not found');
      }

      const emailContent = carVerificationRejectedTemplate(
        updatedUser.fullName,
        updatedCar.carName,
        rejectionReason
      );
      await sendEmail({ to: updatedUser.email, ...emailContent });
    }
    return AdminOwnerMapper.toCarVerifyDTO(updatedCar);
    // return updatedCar;
  }
}

export default AdminOwnerService;
