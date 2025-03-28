import IAdminRepository from "../../../repositories/interfaces/admin/IAdminRepository";
import { IAdmin } from "../../../models/admin/adminModel";
import { ICustomer } from "../../../models/customer/customerModel";
export interface IAdminService{
    loginAdmin(email:string,password:string):Promise<{admin:IAdmin|null,accessToken:string,refreshToken:string}>
    logoutAdmin(refreshToken: string): Promise<void>
    listAllCustomers(): Promise<ICustomer[]>
    updateCustomerStatus(customerId: string, status: -2 | -1 | 0 | 1 | 2): Promise<ICustomer | null>
    verifyCustomer(customerId: string, verificationType: "document" | "full"): Promise<ICustomer | null>

}

