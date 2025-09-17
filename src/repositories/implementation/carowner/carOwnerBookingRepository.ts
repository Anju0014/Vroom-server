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
    async getBookingsForCarOwner(carOwnerId: string,page:number,limit:number): Promise<{bookings:IBooking[],total:number}> {

      const query = { 
    carOwnerId: carOwnerId, 
    status: { $in: ['confirmed', 'cancelled'] } 
  };

  // Total count (before pagination)
  const total = await Booking.countDocuments(query);

        const bookings = await Booking.find(query)
          .populate({
            path: 'userId',
            select: '_id fullName email', 
          })
          .populate({
            path: 'carId',
            select: '_id carName brand model', 
          })
          .sort({ createdAt: -1 })
          . skip((page - 1) * limit)
          .limit(limit);
      
        return {bookings,total};
      }
      

      

}
export default CarOwnerBookingRepository
