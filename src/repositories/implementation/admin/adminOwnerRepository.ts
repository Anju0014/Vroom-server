import {Admin,IAdmin} from "../../../models/admin/adminModel"
import IAdminOwnerRepository from "../../interfaces/admin/IAdminOwnerRepository";
import { BaseRepository } from "../../base/BaseRepository";
import {CarOwner,ICarOwner} from "../../../models/carowner/carOwnerModel"
import { Car, ICar } from "../../../models/car/carModel";
import { Booking,IBooking } from "../../../models/booking/bookingModel";



class AdminOwnerRepository extends BaseRepository<IAdmin> implements IAdminOwnerRepository {
     constructor(){
        super(Admin);
     }

    async getAllOwnerVerify(): Promise<ICarOwner[]> {
        try {
            console.log("reached ,,,,6");
            const carowners = await CarOwner.find({processStatus:2,verifyStatus:0}, "-password -refreshToken");
            console.log("Customers fetched:", carowners);
            if (!carowners || !Array.isArray(carowners)) {  
                console.error("No customers found or invalid format.");
                return [];
            }
            return carowners;
        } catch (error) {
            console.error("Error in getAllOwners:", error);
            throw new Error("Database query failed");
        }
    }


    async getAllCarsVerify(): Promise<ICar[]> {
        try {
            console.log("reached ,,,,6");
            const cars = await Car.find().populate('owner', 'fullName email phoneNumber');
            console.log("Customers fetched:", cars);
            if (!cars || !Array.isArray(cars)) {  
                console.error("No customers found or invalid format.");
                return [];
            }
            return cars;
        } catch (error) {
            console.error("Error in getAllOwners:", error);
            throw new Error("Database query failed");
        }
    }
    
    async getAllBookings(): Promise<IBooking[]> {
        try {
            const bookings = await Booking.find({
                status: { $in: ['confirmed', 'cancelled'] },
              })
              .populate({
                path: 'carOwnerId',
                  select: '_id fullName email', 
              }).populate({
                  path: 'userId',
                  select: '_id fullName email', 
                })
                .populate({
                  path: 'carId',
                  select: '_id carName brand model', 
                })
                .sort({ createdAt: -1 });
            
              return bookings;
        } catch (error) {
            console.error("Error in getAllBookings:", error);
            throw new Error("Database query failed");
        }
    }

    async getAllCars():Promise<ICar[]>{
        const cars=await Car.find({
            verifyStatus: 1,
            isDeleted: false,
            available: true,
          })
          .populate('owner', 'fullName email phoneNumber');
          return cars
    }
    async findCarOwnerById (ownerId:string): Promise<ICarOwner | null>{
        console.log("kiki")
        console.log(ownerId)
        let response=await CarOwner.findById(ownerId);
        console.log(response);
        return response
    }
    
    async updateOwnerStatus(ownerId:string, updateData: Partial<ICarOwner>) :Promise<ICarOwner | null> {
        return await CarOwner.findByIdAndUpdate(ownerId, updateData, { new: true });
    };


    async updateCarStatus(carId:string, updateData: Partial<ICar>) :Promise<ICar| null> {
        return await Car.findByIdAndUpdate(carId, updateData, { new: true });
    };


    async findCarById(carId: string): Promise<ICar | null> {
        return Car.findById(carId);
      }
   
}
export default AdminOwnerRepository