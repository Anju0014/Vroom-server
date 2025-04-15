import { ICar } from "../../../models/car/carModel";
import { ICarOwner } from "../../../models/carowner/carOwnerModel";

export interface ICarService{

     registerNewCar(carDetails: Partial<ICar>, ownerId: string): Promise<ICar>
     getCarsByOwner(ownerId: string): Promise<ICar[]>
     deleteCar(carId: string): Promise<ICar>
      updateCar(carId: string, updatedData: Partial<ICar>): Promise<ICar>
}
