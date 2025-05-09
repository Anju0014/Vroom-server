
import ICarOwnerCarsRepository from "../../../repositories/interfaces/carOwner/ICarOwnerCarsRepository";
import { ICarOwnerCarsService} from "../../interfaces/carOwner/ICarOwnerCarsServices";
import { ICar } from "../../../models/car/carModel";
import mongoose from "mongoose";

class CarOwnerCarsService implements ICarOwnerCarsService {

    private _ownersCarRepository : ICarOwnerCarsRepository;

    constructor(carRepository:ICarOwnerCarsRepository){
        this._ownersCarRepository=carRepository
    }

    async registerNewCar(carDetails: Partial<ICar>, ownerId: string): Promise<ICar> {
        console.log("registering car for owner",ownerId)
          if (!ownerId) throw new Error("Owner ID is required");
        
          const carData: Partial<ICar> = {
            ...carDetails,
            owner: new mongoose.Types.ObjectId(ownerId), // Ensure ObjectId is used
            images: carDetails.images && Array.isArray(carDetails.images) ? carDetails.images : [],
            videos: carDetails.videos && Array.isArray(carDetails.videos) ? carDetails.videos : [],
          };
        
          return await this._ownersCarRepository.createCar(carData);
    }
        async getCarsByOwner(ownerId: string): Promise<ICar[]> {
          return await this._ownersCarRepository.getCarsByOwner(ownerId);
        }


        async deleteCar(carId: string): Promise<ICar> {
            const deletedCar = await this._ownersCarRepository.deleteCarById(carId);
            if (!deletedCar) {
              throw new Error("Car not found or already deleted");
            }
            return deletedCar;
          }


          async updateCar(carId: string, updatedData: Partial<ICar>): Promise<ICar> {
            const existingCar = await this._ownersCarRepository.findCarById(carId);
            if (!existingCar || existingCar.isDeleted) {
              throw new Error("Car not found or has been deleted.");
            }
          
            const updatedCar = await this._ownersCarRepository.updateCarById(carId, updatedData);
            if (!updatedCar) {
              throw new Error("Failed to update the car.");
            }
          
            return updatedCar;
          }
          
          
    
          
}
export default CarOwnerCarsService

