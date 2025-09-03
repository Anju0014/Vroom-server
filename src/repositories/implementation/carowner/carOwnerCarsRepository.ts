import {Admin,IAdmin} from "../../../models/admin/adminModel"
import ICarOwnerCarsRepository from "../../interfaces/carOwner/ICarOwnerCarsRepository";
import { BaseRepository } from "../../base/BaseRepository";
import {Customer,ICustomer} from "../../../models/customer/customerModel"
import {CarOwner,ICarOwner} from "../../../models/carowner/carOwnerModel"
import { Car, ICar } from "../../../models/car/carModel";
import { Booking,IBooking } from "../../../models/booking/bookingModel";
import { Types } from 'mongoose';
import { startOfDay, endOfDay } from "date-fns";

class CarOwnerCarsRepository extends BaseRepository<ICar> implements ICarOwnerCarsRepository {
    constructor(){
        super(Car);
     }
     async createCar(car:Partial<ICar>): Promise<ICar>{
        return await Car.create(car)
    }
    async getCarsByOwner(ownerId: string, page: number, limit: number): Promise<ICar[]> {
        return await Car.find({ owner: ownerId,isDeleted:false })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      }
      async getCarsCount(ownerId: string): Promise<number> {
        return  await Car.countDocuments({ owner: ownerId,isDeleted:false }).exec();
      }

      async updateAvailability(carId: string, ownerId: string, unavailableDates: string[]): Promise<ICar | null> {
    try {
      return await Car.findOneAndUpdate(
        { _id: carId, owner: ownerId, isDeleted: false },
        { unavailableDates },
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error(`Failed to update availability for car ${carId}: ${error}`);
    }
  }

async findByCarId(carId: string, ownerId: string): Promise<IBooking[]> {
  try {

    console.log(carId,ownerId)
    let bookinglist=await Booking.find({
      carId: carId,
      // carOwnerId: new Types.ObjectId(ownerId),
    }).exec();
    console.log(bookinglist)
    return bookinglist
  } catch (error) {
    throw new Error(`Failed to fetch bookings for car ${carId}: ${error}`);
  }
}

  
      async deleteCarById(carId: string): Promise<ICar | null> {
        return await Car.findByIdAndUpdate(
          carId,{ isDeleted: true },{ new: true }
        );
      }

      async updateCarById(carId: string, updatedData: Partial<ICar>): Promise<ICar | null> {
        return await Car.findByIdAndUpdate(carId, updatedData, { new: true });
      }
      
      async findCarById(carId:string): Promise<ICar|null>{
        return await Car.findOne({_id:carId})

      }


    async findActiveBookingByCarId(carId: string): Promise<IBooking | null> {
      const today = new Date();
const start = startOfDay(today);
const end = endOfDay(today);

const activeBookings = await Booking.findOne({
  carId,
  status: "confirmed",
  startDate: { $lte: end },
  endDate: { $gte: start }
});
        console.log("active booking?:",activeBookings)
        return activeBookings
  }


}
export default CarOwnerCarsRepository
