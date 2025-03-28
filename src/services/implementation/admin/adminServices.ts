import IAdminRepository from "../../../repositories/interfaces/admin/IAdminRepository";
import { IAdminService } from "../../interfaces/admin/IAdminServices";
import { IAdmin } from "../../../models/admin/adminModel";
import PasswordUtils from "../../../utils/passwordUtils";
import JwtUtils from "../../../utils/jwtUtils";
import { ICustomer } from "../../../models/customer/customerModel";


class AdminService implements IAdminService {

    private _adminRepository : IAdminRepository;

    constructor(adminRepository:IAdminRepository){
        this._adminRepository=adminRepository
    }
async loginAdmin(email:string, password:string): Promise<{accessToken:string,refreshToken:string,admin:IAdmin|null}>{
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
    const accessToken=JwtUtils.generateAccessToken({id:admin._id, email:admin.email});
    const newRefreshToken=JwtUtils.generateRefreshToken({id:admin._id});

    await this._adminRepository.updateRefreshToken(admin._id.toString(), newRefreshToken);

    return {accessToken,refreshToken:newRefreshToken,admin}
}


async logoutAdmin(refreshToken: string): Promise<void> {
   
    const carOwner = await this._adminRepository.findUserByRefreshToken(refreshToken);
  if (!carOwner) {
    throw new Error("User not found");
  }
  await this._adminRepository.clearRefreshToken(carOwner._id.toString());
}



async listAllCustomers(): Promise<ICustomer[]> {
    return await this._adminRepository.getAllCustomers();
}

async updateCustomerStatus(customerId: string, status: -2 | -1 | 0 | 1 | 2): Promise<ICustomer | null> {
    if (![-2, -1, 0, 1, 2].includes(status)) {
        throw new Error("Invalid status. Use -2, -1, 0, 1, or 2.");
    }
    return await this._adminRepository.updateCustomerStatus(customerId, status);
}

async verifyCustomer(customerId: string, verificationType: "document" | "full"): Promise<ICustomer | null> {
    return await this._adminRepository.verifyCustomer(customerId, verificationType);
}



}







export default AdminService