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


      async getAllCustomers(): Promise<ICustomer[]> {
        return await Customer.find({}, "-password -refreshToken");
    }

    async updateCustomerStatus(customerId: string, status: -2 | -1 | 0 | 1 | 2): Promise<ICustomer | null> {
        return await Customer.findByIdAndUpdate(customerId, { status }, { new: true });
    }

    async verifyCustomer(customerId: string, verificationType: "document" | "full"): Promise<ICustomer | null> {
        let updateData: Partial<ICustomer> = {};

        if (verificationType === "document") {
            updateData.status = 1;
        } else if (verificationType === "full") {
            updateData.status = 2;
            updateData.isVerified = true;
        } else {
            throw new Error("Invalid verification type. Use 'document' or 'full'.");
        }

        return await Customer.findByIdAndUpdate(customerId, updateData, { new: true });
    }
}
export default AdminRepository