import { IBooking } from "../../../models/booking/bookingModel";
import { ICar } from "../../../models/car/carModel";
import { ICarOwner } from "../../../models/carowner/carOwnerModel";
import { BookingData } from "../../../types/bookingData";

export interface ICustomerCarAndBookingService{
   
        getNearbyCars(lat: number, lng: number, maxDistance: number): Promise<ICar[]>;
        getFeaturedCars(): Promise<ICar[]>;
        getCarDetail(carId: string): Promise<ICar | null>;
        getBookedDateRanges(carId: string): Promise<{ start: Date; end: Date }[]>;

        createPendingBooking(bookingdata: BookingData): Promise<string>;
        confirmBooking(bookingId: string, paymentIntentId: string): Promise<void>;
        
        failedBooking(bookingId: string): Promise<void>;

        getCarsCount(filters: {search?: string;minPrice?: number;maxPrice?: number;latitude?: number;longitude?: number;}) : Promise<number>
       getAllCars(page: number, limit: number, filters: {search?: string;minPrice?: number;maxPrice?: number;latitude?: number;longitude?: number;}): Promise<ICar[]>
}
