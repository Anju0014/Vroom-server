import {Customer,ICustomer} from "../../../models/customer/customerModel"
import ICustomerRepository from "../../interfaces/customer/ICustomerRepository";



export default class CustomerRepository implements ICustomerRepository{

  
    async findUserByEmail(email:string): Promise<ICustomer |null>{
        return await Customer.findOne({email})
    }
    async create(user: Partial<ICustomer>): Promise<ICustomer> {
        return await Customer.create(user);
    }
    async updateCustomer(id: string, updatedData: Partial<ICustomer>): Promise<ICustomer> {
        return await Customer.findByIdAndUpdate(id, updatedData, { new: true }) as ICustomer;
    }
    async updateRefreshToken(id:string,refreshToken:string): Promise<void>{
        await Customer.findByIdAndUpdate(id,{refreshToken})
    }
    async updatePassword(id:string,password:string):Promise<void>{
        await Customer.findByIdAndUpdate(id,{password})
    }
    async findUserByRefreshToken(refreshToken: string): Promise<ICustomer | null> {
        return await Customer.findOne({ refreshToken });
      }
    async clearRefreshToken(id: string): Promise<void> {
        await Customer.updateOne({ _id: id }, { $set: { refreshToken: null } });
      }
    
}