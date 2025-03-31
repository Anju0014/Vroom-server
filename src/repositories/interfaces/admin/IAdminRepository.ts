import {IAdmin} from "../../../models/admin/adminModel"
import { ICarOwner } from "../../../models/carowner/carOwnerModel"
import { ICustomer } from "../../../models/customer/customerModel"

interface IAdminRepository{

    findUserByEmail(email:string): Promise<IAdmin |null>
    create(user: Partial<IAdmin>): Promise<IAdmin> 
    updatePassword(adminId:string,password:string):Promise<void>
    updateRefreshToken(carOwnerId:string,refreshToken:string): Promise<void>
    findUserByRefreshToken(refreshToken: string): Promise<IAdmin | null> 
    clearRefreshToken(carOwnerId: string): Promise<void> 
    getAllCustomers(): Promise<ICustomer[]>
    getAllOwners(): Promise<ICarOwner[]>
    verifyCustomer(customerId: string, verificationType: "document" | "full"): Promise<ICustomer | null>
    findCustomerById (customerId:string): Promise<ICustomer | null>
    findCarOwnerById (ownerId:string): Promise<ICarOwner | null>
    updateCustomerStatus(customerId:string, updateData: Partial<ICustomer>) :Promise<ICustomer | null> 
    updateOwnerStatus(ownerId:string, updateData: Partial<ICarOwner>) :Promise<ICarOwner| null> 
}

export default IAdminRepository