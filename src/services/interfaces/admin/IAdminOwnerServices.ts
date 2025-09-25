import { ICarOwner } from "../../../models/carowner/carOwnerModel";
import { ICar } from "../../../models/car/carModel";
import { IBooking } from "../../../models/booking/bookingModel";

export interface IAdminOwnerService{
    listAllOwnerforVerify(page: number,limit: number,search: string,): Promise<{carOwners:ICarOwner[], total: number}>
    listAllCarsforVerify(page: number,limit: number,search: string): Promise<{cars:ICar[], total: number}>
    listAllVerifiedCars(page: number,limit: number,search: string,): Promise<{cars:ICar[], total: number}>
    listAllBookings( page: number,limit: number,search: string,): Promise<{ bookings: IBooking[]; total: number }>

    updateOwnerVerifyStatus(ownerId:string, verifyDetails:Partial<ICarOwner>):Promise<ICarOwner|null>
    updateOwnerBlockStatus(ownerId: string, newStatus: number): Promise<ICarOwner|null> 
    updateCarBlockStatus(carId: string, newStatus: number): Promise<ICar|null> 
    updateCarVerifyStatus(carId:string, verifyDetails:Partial<ICar>):Promise<ICar|null>
    
}

