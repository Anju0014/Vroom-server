import {IAdmin} from "../../../models/admin/adminModel"
import { ICustomer } from "../../../models/customer/customerModel"

interface IAdminRepository{

    findUserByEmail(email:string): Promise<IAdmin |null>
    create(user: Partial<IAdmin>): Promise<IAdmin> 
    updatePassword(adminId:string,password:string):Promise<void>
    updateRefreshToken(carOwnerId:string,refreshToken:string): Promise<void>
    findUserByRefreshToken(refreshToken: string): Promise<IAdmin | null> 
    clearRefreshToken(carOwnerId: string): Promise<void> 
    getAllCustomers(): Promise<ICustomer[]>
    updateCustomerStatus(customerId: string, status: -2 | -1 | 0 | 1 | 2): Promise<ICustomer | null>
    verifyCustomer(customerId: string, verificationType: "document" | "full"): Promise<ICustomer | null>
       
}

export default IAdminRepository