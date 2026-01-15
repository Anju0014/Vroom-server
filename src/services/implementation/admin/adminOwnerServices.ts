import IAdminOwnerRepository from '../../../repositories/interfaces/admin/IAdminOwnerRepository';
import { IAdminOwnerService } from '../../interfaces/admin/IAdminOwnerServices';

import { ICarOwner } from '../../../models/carowner/carOwnerModel';
import { sendEmail } from '../../../utils/emailconfirm';
import { ICar } from '../../../models/car/carModel';
import { IBooking } from '../../../models/booking/bookingModel';
import {
  carVerificationRejectedTemplate,
  verificationApprovedTemplate,
  verificationRejectedTemplate,
} from '../../../templates/emailTemplates';

class AdminOwnerService implements IAdminOwnerService {
  private _adminOwnerRepository: IAdminOwnerRepository;

  constructor(adminOwnerRepository: IAdminOwnerRepository) {
    this._adminOwnerRepository = adminOwnerRepository;
  }

  async listAllOwnerforVerify(
    page: number,
    limit: number,
    search: string
  ): Promise<{ carOwners: ICarOwner[]; total: number }> {
    try {
      console.log('reached222');
      return await this._adminOwnerRepository.getAllOwnerforVerify(page, limit, search);
    } catch (error) {
      console.error('Error in listAllCustomers:', error);
      throw new Error('Failed to fetch customers');
    }
  }

  async listAllCarsforVerify(
    page: number,
    limit: number,
    search: string
  ): Promise<{ cars: ICar[]; total: number }> {
    try {
      console.log('reached222');
      return await this._adminOwnerRepository.getAllCarsforVerify(page, limit, search);
    } catch (error) {
      console.error('Error in listAllCustomers:', error);
      throw new Error('Failed to fetch customers');
    }
  }

  async listAllVerifiedCars(
    page: number,
    limit: number,
    search: string
  ): Promise<{ cars: ICar[]; total: number }> {
    try {
      console.log('reached222');
      return await this._adminOwnerRepository.getAllVerifiedCars(page, limit, search);
    } catch (error) {
      console.error('Error in listAllCustomers:', error);
      throw new Error('Failed to fetch customers');
    }
  }

  async listAllBookings(
    page: number,
    limit: number,
    search: string
  ): Promise<{ bookings: IBooking[]; total: number }> {
    try {
      console.log('reached222');
      return await this._adminOwnerRepository.getAllBookings(page, limit, search);
    } catch (error) {
      console.error('Error in listAllBookings:', error);
      throw new Error('Failed to fetch bookings');
    }
  }

  async updateOwnerVerifyStatus(
    ownerId: string,
    verifyDetails: Partial<ICarOwner>
  ): Promise<ICarOwner | null> {
    const { verifyStatus, rejectionReason } = verifyDetails;
    if (verifyStatus === -1 && !rejectionReason) {
      throw new Error('Reason is required when rejecting');
    }
    const user = await this._adminOwnerRepository.findCarOwnerById(ownerId);
    console.log('poskook', user);
    if (!user) {
      throw new Error(' User Not Found');
    }
    let updatedUser = await this._adminOwnerRepository.updateOwnerStatus(ownerId, verifyDetails);
    console.log('pknns', updatedUser);
    if (!updatedUser) {
      throw new Error('Error in updating the status');
    }
    console.log('useremail ', updatedUser.email);
    //  if (verifyStatus === -1) {
    //     await sendEmail({
    //       to: updatedUser.email,
    //       subject: "Verification Rejected",
    //       text: `Dear ${updatedUser.fullName},\n\nYour verification has been rejected due to the following reason:\n${rejectionReason}\n\nPlease address the issue and  reapply.\n\nBest regards,\nVroom Support Team`
    //     });
    //   }else if(verifyStatus===1){
    //     await sendEmail({
    //       to:updatedUser.email,
    //       subject:"Verification Approved",
    //       text: `Dear ${updatedUser.fullName},\n\nYour Vroom  verification has been Approved. You can login to your account and add the car listings. \n\nBest regards,\nVroom Support Team`
    //     })
    if (verifyStatus === -1) {
      const emailContent = verificationRejectedTemplate(updatedUser.fullName, rejectionReason);
      await sendEmail({ to: updatedUser.email, ...emailContent });
    } else if (verifyStatus === 1) {
      const emailContent = verificationApprovedTemplate(updatedUser.fullName);
      await sendEmail({ to: updatedUser.email, ...emailContent });
    }

    console.log('message');
    return updatedUser;
  }

  async updateOwnerBlockStatus(ownerId: string, newStatus: number): Promise<ICarOwner | null> {
    console.log('Processing status update:', ownerId, newStatus);
    const user = await this._adminOwnerRepository.findCarOwnerById(ownerId);
    if (!user) throw new Error('User not found');
    let updateData: Partial<ICarOwner> = { blockStatus: newStatus };
    return await this._adminOwnerRepository.updateOwnerStatus(ownerId, updateData);
  }

  async updateCarBlockStatus(carId: string, newStatus: number): Promise<ICar | null> {
    console.log('Processing status update:', carId, newStatus);
    const car = await this._adminOwnerRepository.findCarById(carId);
    if (!car) throw new Error('Car not found');
    let updateData: Partial<ICar> = { blockStatus: newStatus };
    return await this._adminOwnerRepository.updateCarStatus(carId, updateData);
  }

  async updateCarVerifyStatus(carId: string, verifyDetails: Partial<ICar>): Promise<ICar | null> {
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

      // await sendEmail({
      //   to: updatedUser.email,
      //   subject: "Verification Rejected",
      //   text: `Dear ${updatedUser.fullName},\n\nYour car ${updatedCar.carName} verification has been rejected due to the following reason:\n${rejectionReason}\n\nPlease address the issue and reapply.\n\nBest regards,\nVroom Support Team`,
      // });
    }

    return updatedCar;
  }
}

export default AdminOwnerService;
