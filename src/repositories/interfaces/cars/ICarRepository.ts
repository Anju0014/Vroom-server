import { ICar } from '../../../models/car/carModel';
import { ICarOwner } from '../../../models/carowner/carOwnerModel';

interface ICarRepository {
  createCar(carData: Partial<ICar>): Promise<ICar>;
  getCarsByOwner(ownerId: string, page: number, limit: number): Promise<ICar[]>;
  getCarsCountByOwner(filters: any): Promise<number>;
  getCarsCount(filters: any): Promise<number>;
  updateAvailability(carId: string, ownerId: string, unavailableDates: string[]): Promise<ICar | null>;
  deleteCarById(carId: string): Promise<ICar | null>;
  updateCarById(carId: string, updatedData: Partial<ICar>): Promise<ICar | null>;
  findCarById(carId: string): Promise<ICar | null>;
  findNearbyCars(lat: number, lng: number, maxDistance: number): Promise<ICar[]>;
  findFeaturedCars(): Promise<ICar[]>;
  findBookedDates(carId: string): Promise<{ start: Date; end: Date }[]>;
  getAllCars(
    page: number,
    limit: number,
    filters: {
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      carType?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      latitude?: number;
      longitude?: number;
    }
  ): Promise<ICar[]>;
  getAllCarsForVerify(page: number, limit: number, search: string): Promise<{ cars: ICar[]; total: number }>;
  getAllVerifiedCars(page: number, limit: number, search: string): Promise<{ cars: ICar[]; total: number }>;
  findCarOwnerById(ownerId: string): Promise<ICarOwner | null>;
}
export default ICarRepository