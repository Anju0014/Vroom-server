import {Admin,IAdmin} from "../../../models/admin/adminModel"
import ICustomerCarAndBookingRepository from "../../interfaces/customer/ICustomerCarAndBookingRepository";
import { BaseRepository } from "../../base/BaseRepository";
import { HydratedDocument } from 'mongoose';
import {Customer,ICustomer} from "../../../models/customer/customerModel"
import {CarOwner,ICarOwner} from "../../../models/carowner/carOwnerModel"
import { Car, ICar } from "../../../models/car/carModel";
import { Booking,IBooking } from "../../../models/booking/bookingModel";
import { BookingData } from "../../../types/bookingData";
import { Counter } from '../../../models/counter/counterModel'; // wherever your model is



class CustomerCarAndBookingRepository extends BaseRepository<ICar> implements ICustomerCarAndBookingRepository {
    constructor(){
        super(Car);
     }

    //  async createCar(car:Partial<ICar>): Promise<ICar>{
    //     return await Car.create(car)
    // }
    // async getCarsByOwner(ownerId: string): Promise<ICar[]> {
    //     return await Car.find({ owner: ownerId,isDeleted:false });
    //   }


    //   async deleteCarById(carId: string): Promise<ICar | null> {
    //     return await Car.findByIdAndUpdate(
    //       carId,
    //       { isDeleted: true },
    //       { new: true }
    //     );
    //   }

    //   async updateCarById(carId: string, updatedData: Partial<ICar>): Promise<ICar | null> {
    //     return await Car.findByIdAndUpdate(carId, updatedData, { new: true });
    //   }
      
    //   async findCarById(carId:string): Promise<ICar|null>{
    //     return await Car.findOne({_id:carId})

    //   }

      async findNearbyCars(lat: number, lng: number, maxDistance: number): Promise<ICar[]> {
        return Car.find({
          verifyStatus: 1,
          isDeleted: false,
          available: true,
          'location.coordinates': {
            $nearSphere: {
              $geometry: {
                type: 'Point',
                coordinates: [lng, lat],
              },
              $maxDistance: maxDistance * 1000, // km to meters
            },
          },
        });
      }
      // async findNearbyCars(lat: number, lng: number, maxDistance: number): Promise<ICar[]> {
      //   return Car.aggregate([
      //     {
      //       $geoNear: {
      //         near: { type: 'Point', coordinates: [lng, lat] },
      //         distanceField: 'distance',
      //         spherical: true,
      //         maxDistance: maxDistance * 1000, 
      //         query: {
      //           verifyStatus: 1,
      //           isDeleted: false,
      //           available: true,
      //         },
      //       },
      //     },
      //     {
      //       $lookup: {
      //         from: 'carowners', 
      //         localField: 'owner',
      //         foreignField: '_id',
      //         as: 'ownerDetails',
      //       },
      //     },
      //     { $unwind: '$ownerDetails' },
      //     {
      //       $match: {
      //         'ownerDetails.verifyStatus': 1,
      //         'ownerDetails.blockStatus': 0,
      //       },
      //     },
      //   ]);
      // }
      
    
      async findFeaturedCars(): Promise<ICar[]> {
        return Car.find({
          verifyStatus: 1,
          isDeleted: false,
          available: true,
        });
      }

      // async findFeaturedCars(): Promise<ICar[]> {
      //   return Car.aggregate([
      //     {
      //       $match: {
      //         verifyStatus: 1,
      //         isDeleted: false,
      //         available: true,
      //       },
      //     },
      //     {
      //       $lookup: {
      //         from: 'owners', 
      //         localField: 'owner',
      //         foreignField: '_id',
      //         as: 'ownerDetails',
      //       },
      //     },
      //     { $unwind: '$ownerDetails' },
      //     {
      //       $match: {
      //         'ownerDetails.verifyStatus': 1,
      //         'ownerDetails.blockStatus': 0,
      //       },
      //     },
      //   ]);
      // }
      
    
      async findCarById(carId: string): Promise<ICar | null> {
        return Car.findById(carId);
      }
    
      async findBookedDates(carId: string): Promise<{ start: Date; end: Date }[]> {
        const bookings = await Booking.find({ carId, status: 'confirmed' }, 'startDate endDate');
        return bookings.map(b => ({ start: b.startDate, end: b.endDate }));
      }


   async createBooking(data: BookingData): Promise<IBooking> {
  return Booking.create(data);
}

    
      async findBookingById(bookingId: string): Promise<IBooking | null> {
        return Booking.findById(bookingId);
      }
    
      // async saveBooking(bookingData: IBooking): Promise<IBooking> {
      //   return bookingData.save();
      // }
      async saveBooking(bookingData: HydratedDocument<IBooking>): Promise<IBooking> {
        console.log("reached for save")
        return bookingData.save();
      }
    
      async deleteBooking(bookingId: string): Promise<void> {
        await Booking.deleteOne({ _id: bookingId });
      }
    
      async findConflictingBooking(carId: string, startDate: Date, endDate: Date): Promise<IBooking | null> {
        return Booking.findOne({
          carId,
          status: { $in: ['confirmed'] },
          $or: [
            { startDate: { $lte: endDate, $gte: startDate } },
            { endDate: { $lte: endDate, $gte: startDate } },
          ],
        });
      }
      async checkOldBooking(bookingData:BookingData): Promise<IBooking|null>{
            return Booking.findOne({
              carId:bookingData.carId,
             userId:bookingData.userId,
            startDate:bookingData.startDate,
            endDate:bookingData.endDate,
            status: 'pending',
            })
      }
    async generateBookingId():Promise<string> {
        const counter = await Counter.findOneAndUpdate(
          { id: 'bookingId' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
      
        const paddedSeq = counter.seq.toString().padStart(4, '0'); // 0001, 0023, etc
        return `VROOM-RIDE-${paddedSeq}`;
      }
    



}
export default CustomerCarAndBookingRepository
