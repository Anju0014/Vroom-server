
import { ICarOwner } from "../../../models/carowner/carOwnerModel"
import { ICar } from "../../../models/car/carModel"
import { Booking,IBooking } from "../../../models/booking/bookingModel";
import { BookingData } from "../../../types/bookingData";

interface ICarOwnerBookingRepository{
    getBookingsForCarOwner(carOwnerId: string,page:number,limit:number): Promise<{bookings:IBooking[],total:number}>



}
export default ICarOwnerBookingRepository