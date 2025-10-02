import { ICar } from '../../../models/car/carModel';

export interface ICarService {
  registerNewCar(carDetails: Partial<ICar>, ownerId: string): Promise<ICar>;
  getCarsByOwner(ownerId: string, page: number, limit: number): Promise<ICar[]>;
  getCarsCountByOwner(ownerId: string): Promise<number>;
  updateCarAvailability(carId: string, ownerId: string, unavailableDates: string[]): Promise<ICar>;
  deleteCar(carId: string): Promise<ICar>;
  updateCar(carId: string, updatedData: Partial<ICar>): Promise<ICar>;
  getNearbyCars(lat: number, lng: number, maxDistance: number): Promise<ICar[]>;
  getFeaturedCars(): Promise<ICar[]>;
  getCarDetail(carId: string): Promise<ICar | null>;
  getBookedDateRanges(carId: string): Promise<{ start: Date; end: Date }[]>;
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
  getCarsCount(filters: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    carType?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<number>;
  listAllCarsForVerify(page: number, limit: number, search: string): Promise<{ cars: ICar[]; total: number }>;
  listAllVerifiedCars(page: number, limit: number, search: string): Promise<{ cars: ICar[]; total: number }>;
  updateCarBlockStatus(carId: string, newStatus: boolean): Promise<ICar | null>;
  updateCarVerifyStatus(carId: string, verifyDetails: Partial<ICar>): Promise<ICar | null>;
}