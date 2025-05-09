import {CarOwner,ICarOwner} from "../../../models/carowner/carOwnerModel"
import ICarOwnerRepository from "../../interfaces/carOwner/ICarOwnerRepository";
import { BaseRepository } from "../../base/BaseRepository";
import { Car, ICar } from "../../../models/car/carModel";


class CarOwnerRepository extends BaseRepository<ICarOwner> implements ICarOwnerRepository {
     constructor(){
        super(CarOwner);
     }
    async findUserByEmail(email:string): Promise<ICarOwner |null>{
        return await CarOwner.findOne({email})
    }
    async create(user: Partial<ICarOwner>): Promise<ICarOwner> {
        return await CarOwner.create(user);
    }
    async updateCarOwner(carOwnerId: string, updatedData: Partial<ICarOwner>): Promise<ICarOwner> {
        return await CarOwner.findByIdAndUpdate(carOwnerId, updatedData, { new: true }) as ICarOwner;
    }
    async updateRefreshToken(carOwnerId:string,refreshToken:string): Promise<void>{
        const result=await CarOwner.findByIdAndUpdate(carOwnerId,{refreshToken})
        if(!result){
            console.log("not updating")
        }
    }
    async updatePassword(carOwnerId:string,password:string):Promise<void>{
        await CarOwner.findByIdAndUpdate(carOwnerId,{password})
    }
    async findUserByRefreshToken(refreshToken: string): Promise<ICarOwner | null> {
        return await CarOwner.findOne({ refreshToken });
      }
    async clearRefreshToken(carOwnerId: string): Promise<void> {
        await CarOwner.updateOne({ _id: carOwnerId }, { $set: { refreshToken: null } });
      }
      async findById(carOwnerId:string): Promise<ICarOwner |null>{
        return await CarOwner.findOne({_id:carOwnerId})
    }

   
}
export default CarOwnerRepository