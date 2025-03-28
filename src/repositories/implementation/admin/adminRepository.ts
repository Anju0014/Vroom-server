import {Admin,IAdmin} from "../../../models/admin/adminModel"
import IAdminRepository from "../../interfaces/admin/IAdminRepository";
import { BaseRepository } from "../../base/BaseRepository";
import {Customer,ICustomer} from "../../../models/customer/customerModel"

class AdminRepository extends BaseRepository<IAdmin> implements IAdminRepository {

     constructor(){
        super(Admin);
     }
    async findUserByEmail(email:string): Promise<IAdmin |null>{
        return await Admin.findOne({email})
    }
    async create(user: Partial<IAdmin>): Promise<IAdmin> {
        return await Admin.create(user);
    }
    async updatePassword(adminId:string,password:string):Promise<void>{
        await Admin.findByIdAndUpdate(adminId,{password})
    }
    async findUserByRefreshToken(refreshToken: string): Promise<IAdmin | null> {
        return await Admin.findOne({ refreshToken });
      }
    async updateRefreshToken(adminId:string,refreshToken:string): Promise<void>{
        await Admin.findByIdAndUpdate(adminId,{refreshToken})
    }
    async clearRefreshToken(adminId: string): Promise<void> {
        await Admin.updateOne({ _id: adminId }, { $set: { refreshToken: null } });
      }


 
}
export default AdminRepository