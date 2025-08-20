
import { ICarOwner } from "../../../models/carowner/carOwnerModel"
import { ICar } from "../../../models/car/carModel"
import { Booking,IBooking } from "../../../models/booking/bookingModel";
import { BookingData } from "../../../types/bookingData";

interface ICustomerCarAndBookingRepository{
    // createCar(car:Partial<ICar>): Promise<ICar>
    // getCarsByOwner(ownerId: string): Promise<ICar[]> 
    // findCarById(carId:string): Promise<ICar|null>
    // deleteCarById(carId: string): Promise<ICar | null>
    // updateCarById(carId: string, updatedData: Partial<ICar>): Promise<ICar | null>

  
  findNearbyCars(lat: number, lng: number, maxDistance: number): Promise<ICar[]>;
  findFeaturedCars(): Promise<ICar[]>;
  findCarById(carId: string): Promise<ICar | null>;
  findBookedDates(carId: string): Promise<{ start: Date; end: Date }[]>;
  createBooking(bookingData:BookingData): Promise<IBooking>;
  findBookingById(bookingId: string): Promise<IBooking | null>;
  saveBooking(bookingData:IBooking): Promise<IBooking>;
  deleteBooking(bookingId: string): Promise<void>;
  findConflictingBooking(carId: string,startDate: Date,endDate: Date): Promise<IBooking | null>;
  checkOldBooking(bookingData:BookingData): Promise<IBooking|null>
  generateBookingId():Promise<string>
  getAllCars(page: number, limit: number, filters: {search?: string;minPrice?: number;maxPrice?: number;latitude?: number;longitude?: number;}):Promise<ICar[]>
  getCarsCount(filters: {search?: string;minPrice?: number;maxPrice?: number;latitude?: number;longitude?: number;}):Promise<number> 

}

export default ICustomerCarAndBookingRepository