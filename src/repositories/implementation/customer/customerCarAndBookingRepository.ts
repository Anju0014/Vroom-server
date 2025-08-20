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
    
      async findFeaturedCars(): Promise<ICar[]> {
        return Car.find({
          verifyStatus: 1,
          isDeleted: false,
          available: true,
        });
      }


  async getAllCars(page: number, limit: number, filters: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    latitude?: number;
    longitude?: number;
  }) :Promise<ICar[]>{
    const query: any = { isDeleted: false, verifyStatus: 1 };
    if (filters.search) {
      query.carName = { $regex: filters.search, $options: 'i' };
    }
    if (filters.minPrice) {
      query.expectedWage = { ...query.expectedWage, $gte: filters.minPrice };
    }
    if (filters.maxPrice !== Infinity) {
      query.expectedWage = { ...query.expectedWage, $lte: filters.maxPrice };
    }
    if (filters.latitude && filters.longitude) {
      query['location.coordinates'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [filters.longitude, filters.latitude] },
          $maxDistance: 10000, // 10km radius
        },
      };
    }

    console.log('Query:', query);
    const cars = await Car.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    console.log('Found cars:', cars);
    return cars;
  }

  async getCarsCount(filters: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    latitude?: number;
    longitude?: number;
  }):Promise<number> {
    const query: any = { isDeleted: false, verifyStatus: 1 };
    if (filters.search) {
      query.carName = { $regex: filters.search, $options: 'i' };
    }
    if (filters.minPrice) {
      query.expectedWage = { ...query.expectedWage, $gte: filters.minPrice };
    }
    if (filters.maxPrice !== Infinity) {
      query.expectedWage = { ...query.expectedWage, $lte: filters.maxPrice };
    }
    if (filters.latitude && filters.longitude) {
      query['location.coordinates'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [filters.longitude, filters.latitude] },
          $maxDistance: 10000,
        },
      };
    }

    const count = await Car.countDocuments(query).exec();
    console.log('Total cars count:', count);
    return count;
  }

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
