import mongoose from "mongoose"
import {IAdmin} from "../../../models/admin/adminModel"
import { ICar } from "../../../models/car/carModel"
import { ICarOwner } from "../../../models/carowner/carOwnerModel"

interface IAdminOwnerRepository{

    getAllOwnerVerify(): Promise<ICarOwner[]>
    getAllCarsVerify(): Promise<ICar[]>
    findCarOwnerById (ownerId:string): Promise<ICarOwner | null>
    updateOwnerStatus(ownerId:string, updateData: Partial<ICarOwner>) :Promise<ICarOwner| null> 
    findCarById(carId: string): Promise<ICar | null>
    updateCarStatus(carId: string, verifyDetails: Partial<ICar>): Promise<ICar | null>

}

export default IAdminOwnerRepository