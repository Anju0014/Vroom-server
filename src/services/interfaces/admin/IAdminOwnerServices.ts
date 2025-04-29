import { ICarOwner } from "../../../models/carowner/carOwnerModel";
import { ICar } from "../../../models/car/carModel";
import { IBooking } from "../../../models/booking/bookingModel";

export interface IAdminOwnerService{
    listAllOwnerVerify(): Promise<ICarOwner[]>
    listAllCarsVerify(): Promise<ICar[]>
    updateOwnerVerifyStatus(ownerId:string, verifyDetails:Partial<ICarOwner>):Promise<ICarOwner|null>
    updateOwnerBlockStatus(ownerId: string, newStatus: number): Promise<ICarOwner|null> 
    updateCarVerifyStatus(carId:string, verifyDetails:Partial<ICar>):Promise<ICar|null>
    listAllBookings(): Promise<IBooking[]>
}

