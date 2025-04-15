import IAdminRepository from "../../../repositories/interfaces/admin/IAdminRepository";
import { IAdmin } from "../../../models/admin/adminModel";
import { ICustomer } from "../../../models/customer/customerModel";
import { ICarOwner } from "../../../models/carowner/carOwnerModel";
import { ICar } from "../../../models/car/carModel";
export interface IAdminService{
    loginAdmin(email:string,password:string):Promise<{admin:IAdmin|null,adminAccessToken:string,refreshToken:string}>
    logoutAdmin(refreshToken: string): Promise<void>
    listAllCustomers(): Promise<ICustomer[]>
    listAllCarOwners(): Promise<ICarOwner[]>
    listAllOwnerVerify(): Promise<ICarOwner[]>
    listAllCarsVerify(): Promise<ICar[]>
    updateVerifyStatus(ownerId:string, verifyDetails:Partial<ICarOwner>):Promise<ICarOwner|null>
    // updateCustomerStatus(customerId: string, status: -2 | -1 | 0 | 1 | 2): Promise<ICustomer | null>
    // verifyCustomer(customerId: string, verificationType: "document" | "full"): Promise<ICustomer | null>
    // updateOwnerStatus(customerId: string, status: -2 | -1 | 0 | 1 | 2): Promise<ICustomer | null>
    // verifyOwner(customerId: string, verificationType: "document" | "full"): Promise<ICustomer | null>
    updateCustomerBlockStatus(customerId: string, newStatus: number): Promise<ICustomer|null> 
    updateOwnerBlockStatus(ownerId: string, newStatus: number): Promise<ICarOwner|null> 
   
    // updateCarVerifyStatus(carId:string, verifyDetails:Partial<ICar>):Promise<ICar|null>
    updateCarVerifyStatus(carId:string, verifyDetails:Partial<ICar>):Promise<ICar|null>
}

