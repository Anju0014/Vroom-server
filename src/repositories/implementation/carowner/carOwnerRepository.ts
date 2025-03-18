import {CarOwner,ICarOwner} from "../../../models/carowner/carOwnerModel"
import ICarOwnerRepository from "../../interfaces/carowner/ICarOwnerRepository";



export default class CarOwnerRepository implements ICarOwnerRepository{

  
    async findUserByEmail(email:string): Promise<ICarOwner |null>{
        return await CarOwner.findOne({email})
    }
    async create(user: Partial<ICarOwner>): Promise<ICarOwner> {
        return await CarOwner.create(user);
    }
    async updateCarOwner(id: string, updatedData: Partial<ICarOwner>): Promise<ICarOwner> {
        return await CarOwner.findByIdAndUpdate(id, updatedData, { new: true }) as ICarOwner;
    }
    async updateRefreshToken(id:string,refreshToken:string): Promise<void>{
        await CarOwner.findByIdAndUpdate(id,{refreshToken})
    }
    async updatePassword(id:string,password:string):Promise<void>{
        await CarOwner.findByIdAndUpdate(id,{password})
    }
    async findUserByRefreshToken(refreshToken: string): Promise<ICarOwner | null> {
        return await CarOwner.findOne({ refreshToken });
      }
    async clearRefreshToken(id: string): Promise<void> {
        await CarOwner.updateOne({ _id: id }, { $set: { refreshToken: null } });
      }
}