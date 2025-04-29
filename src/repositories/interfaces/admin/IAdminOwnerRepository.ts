import mongoose from "mongoose"
import {IAdmin} from "../../../models/admin/adminModel"
import { ICar } from "../../../models/car/carModel"
import { ICarOwner } from "../../../models/carowner/carOwnerModel"
import { IBooking } from "../../../models/booking/bookingModel"

interface IAdminOwnerRepository{

    getAllOwnerVerify(): Promise<ICarOwner[]>
    getAllCarsVerify(): Promise<ICar[]>
    findCarOwnerById (ownerId:string): Promise<ICarOwner | null>
    updateOwnerStatus(ownerId:string, updateData: Partial<ICarOwner>) :Promise<ICarOwner| null> 
    findCarById(carId: string): Promise<ICar | null>
    updateCarStatus(carId: string, verifyDetails: Partial<ICar>): Promise<ICar | null>
    getAllCars():Promise<ICar[]>
    getAllBookings():Promise<IBooking[]>

}

export default IAdminOwnerRepository