import { IBooking } from "../../../models/booking/bookingModel";
import { ICar } from "../../../models/car/carModel";
import { ICarOwner } from "../../../models/carowner/carOwnerModel";
import { BookingData } from "../../../types/bookingData";

export interface ICustomerDashBoardService{
    getCustomerBookings (userId: string):Promise<any>
    cancelBooking(bookingId: string): Promise<void>;
   
       
}
