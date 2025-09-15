import IAdminRepository from "../../../repositories/interfaces/admin/IAdminRepository";
import { IAdminService } from "../../interfaces/admin/IAdminServices";
import { IAdmin } from "../../../models/admin/adminModel";
import PasswordUtils from "../../../utils/passwordUtils";
import JwtUtils from "../../../utils/jwtUtils";
import { ICustomer } from "../../../models/customer/customerModel";
import { ICarOwner } from "../../../models/carowner/carOwnerModel";
import { sendEmail } from "../../../utils/emailconfirm";
import { ICar } from "../../../models/car/carModel";


class AdminService implements IAdminService {

    private _adminRepository : IAdminRepository;

    constructor(adminRepository:IAdminRepository){
        this._adminRepository=adminRepository
    }
async loginAdmin(email:string, password:string): Promise<{adminAccessToken:string,refreshToken:string,admin:IAdmin|null}>{
    console.log(`checking login things`);
    const admin=await this._adminRepository.findUserByEmail(email);
    console.log(admin)
    if(!admin){
        console.log("not correct user")
        throw new Error("Invalid Credentials");
    }
    const passwordTrue = await PasswordUtils.comparePassword(password,admin.password)
    if(!passwordTrue){
        console.log("not correct")
        throw new Error("Invalid Credentials")
    }
    const adminAccessToken=JwtUtils.generateAccessToken({id:admin._id, email:admin.email,role:'admin'});
    const newRefreshToken=JwtUtils.generateRefreshToken({id:admin._id});

    await this._adminRepository.updateRefreshToken(admin._id.toString(), newRefreshToken);
    const admin2 = await this._adminRepository.findUserByRefreshToken(newRefreshToken);
    console.log(admin2)
    console.log(newRefreshToken)

    return {adminAccessToken,refreshToken:newRefreshToken,admin}
}


async logoutAdmin(refreshToken: string): Promise<void> {
   
    console.log(refreshToken)
    const admin = await this._adminRepository.findUserByRefreshToken(refreshToken);
    console.log(admin)
  if (!admin) {
    console.log("error")
    throw new Error("User not found");
  }
  await this._adminRepository.clearRefreshToken(admin._id.toString());
}


async listAllCustomers(page: number,limit: number,search: string,): Promise<{customers:ICustomer[], total: number}>{
    try {
        console.log("reached222");
        return await this._adminRepository.getAllCustomers(page,limit,search);
    } catch (error) {
        console.error("Error in listAllCustomers:", error);
        throw new Error("Failed to fetch customers");
    }
}
async listAllCarOwners(page: number,limit: number,search: string,): Promise<{carOwners:ICarOwner[], total: number}> {
    try {
        console.log("reached222");
        return await this._adminRepository.getAllOwners(page,limit,search);
    } catch (error) {
        console.error("Error in listAllCustomers:", error);
        throw new Error("Failed to fetch customers");
    }
}

    async updateCustomerBlockStatus(customerId: string, newStatus: number): Promise<ICustomer | null> {
        console.log("Processing status update:", customerId, newStatus);
        const user = await this._adminRepository.findCustomerById(customerId);
        if (!user) throw new Error("User not found")
        let updateData: Partial<ICustomer> = { blockStatus: newStatus };
        return await this._adminRepository.updateCustomerStatus(customerId, updateData);
    
}



}

export default AdminService
