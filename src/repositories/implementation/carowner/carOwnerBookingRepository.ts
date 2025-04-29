import {Admin,IAdmin} from "../../../models/admin/adminModel"
import ICarOwnerBookingRepository from "../../interfaces/carOwner/ICarOwnerBookingRepository";
import { BaseRepository } from "../../base/BaseRepository";
import {Customer,ICustomer} from "../../../models/customer/customerModel"
import {CarOwner,ICarOwner} from "../../../models/carowner/carOwnerModel"
import { Car, ICar } from "../../../models/car/carModel";
import { Booking, IBooking } from "../../../models/booking/bookingModel";




class CarOwnerBookingRepository extends BaseRepository<ICar> implements ICarOwnerBookingRepository {
    constructor(){
        super(Car);
     }

    //  async getBookingsForCarOwner(carOwnerId: string): Promise<IBooking[]> {
    //     const bookings = await Booking.find({
    //       carOwnerId: carOwnerId,
    //       status: { $in: ['confirmed', 'cancelled'] },
    //     }).sort({ createdAt: -1 }); 
      
    //     return bookings;
    //   }
    async getBookingsForCarOwner(carOwnerId: string): Promise<IBooking[]> {
        const bookings = await Booking.find({
          carOwnerId: carOwnerId,
          status: { $in: ['confirmed', 'cancelled'] },
        })
          .populate({
            path: 'userId',
            select: '_id fullName email', 
          })
          .populate({
            path: 'carId',
            select: '_id carName brand model', 
          })
          .sort({ createdAt: -1 });
      
        return bookings;
      }
      

}
export default CarOwnerBookingRepository
