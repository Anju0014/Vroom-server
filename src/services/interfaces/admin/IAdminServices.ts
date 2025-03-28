import IAdminRepository from "../../../repositories/interfaces/admin/IAdminRepository";
import { IAdmin } from "../../../models/admin/adminModel";
import { ICustomer } from "../../../models/customer/customerModel";
export interface IAdminService{
    loginAdmin(email:string,password:string):Promise<{admin:IAdmin|null,accessToken:string,refreshToken:string}>
    logoutAdmin(refreshToken: string): Promise<void>
    
}

