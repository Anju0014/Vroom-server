import IAdminOwnerRepository from "../../../repositories/interfaces/admin/IAdminOwnerRepository";
import { IAdminOwnerService } from "../../interfaces/admin/IAdminOwnerServices";
import { IAdmin } from "../../../models/admin/adminModel";
import JwtUtils from "../../../utils/jwtUtils";
import { ICarOwner } from "../../../models/carowner/carOwnerModel";
import { sendEmail } from "../../../utils/emailconfirm";
import { ICar } from "../../../models/car/carModel";
import { IBooking } from "../../../models/booking/bookingModel";


class AdminOwnerService implements IAdminOwnerService {

    private _adminOwnerRepository : IAdminOwnerRepository;

    constructor(adminOwnerRepository:IAdminOwnerRepository){
        this._adminOwnerRepository=adminOwnerRepository
    }

async listAllOwnerVerify(): Promise<ICarOwner[]> {
    try {
        console.log("reached222");
        return await this._adminOwnerRepository.getAllOwnerVerify();
    } catch (error) {
        console.error("Error in listAllCustomers:", error);
        throw new Error("Failed to fetch customers");
    }
}

async listAllCarsVerify(): Promise<ICar[]> {
    try {
        console.log("reached222");
        return await this._adminOwnerRepository.getAllCarsVerify();
    } catch (error) {
        console.error("Error in listAllCustomers:", error);
        throw new Error("Failed to fetch customers");
    }
}


async listAllBookings(): Promise<IBooking[]> {
  try {
      console.log("reached222");
      return await this._adminOwnerRepository.getAllBookings();
  } catch (error) {
      console.error("Error in listAllBookings:", error);
      throw new Error("Failed to fetch bookings");
  }
}

    async updateOwnerVerifyStatus(ownerId:string, verifyDetails:Partial<ICarOwner>):Promise<ICarOwner|null>{
       
        const { verifyStatus, rejectionReason } = verifyDetails;
        if (verifyStatus === -1 && !rejectionReason) {
            throw new Error("Reason is required when rejecting");
          }
        const user = await this._adminOwnerRepository.findCarOwnerById(ownerId);
        console.log("poskook",user)
        if(!user){
            throw new Error(" User Not Found");
        }
         let updatedUser=await this._adminOwnerRepository.updateOwnerStatus(ownerId, verifyDetails);
         console.log("pknns",updatedUser)
         if(!updatedUser){
            throw new Error('Error in updating the status')
         }
         console.log("useremail " , updatedUser.email)
         if (verifyStatus === -1) {
            await sendEmail({
              to: updatedUser.email,
              subject: "Verification Rejected",
              text: `Dear ${updatedUser.fullName},\n\nYour verification has been rejected due to the following reason:\n${rejectionReason}\n\nPlease address the issue and  reapply.\n\nBest regards,\nVroom Support Team`
            });
          }else if(verifyStatus===1){
            await sendEmail({
              to:updatedUser.email,
              subject:"Verification Approved",
              text: `Dear ${updatedUser.fullName},\n\nYour Vroom  verification has been Approved. You can login to your account and add the car listings. \n\nBest regards,\nVroom Support Team`
            })
            
          }
          console.log("message")
          return updatedUser 

    }

    

async updateOwnerBlockStatus(ownerId: string, newStatus: number): Promise<ICarOwner | null> {
    console.log("Processing status update:", ownerId, newStatus)
    const user = await this._adminOwnerRepository.findCarOwnerById(ownerId);
    if (!user) throw new Error("User not found");
    let updateData: Partial<ICarOwner> = { blockStatus: newStatus };
    return await this._adminOwnerRepository.updateOwnerStatus(ownerId, updateData);

}


async updateCarVerifyStatus(carId: string, verifyDetails: Partial<ICar>): Promise<ICar | null> {
    const { verifyStatus, rejectionReason } = verifyDetails;

    if (verifyStatus === -1 && !rejectionReason) {
      throw new Error("Reason is required when rejecting");
    }

    const car = await this._adminOwnerRepository.findCarById(carId);
    if (!car) {
      throw new Error("Car not found");
    }

    const updatedCar = await this._adminOwnerRepository.updateCarStatus(carId, verifyDetails);
    if (!updatedCar) {
      throw new Error("Error updating car status");
    }

    if (verifyStatus === -1) {
      const updatedUser = await this._adminOwnerRepository.findCarOwnerById(String(updatedCar.owner));
      if (!updatedUser) {
        throw new Error("Car owner not found");
      }

      await sendEmail({
        to: updatedUser.email,
        subject: "Verification Rejected",
        text: `Dear ${updatedUser.fullName},\n\nYour car ${updatedCar.carName} verification has been rejected due to the following reason:\n${rejectionReason}\n\nPlease address the issue and reapply.\n\nBest regards,\nVroom Support Team`,
      });
    }

    return updatedCar;
  }

}


export default AdminOwnerService