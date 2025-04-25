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
    updateCustomerBlockStatus(customerId: string, newStatus: number): Promise<ICustomer|null> 
    
}

