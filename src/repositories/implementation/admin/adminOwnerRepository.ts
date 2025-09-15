import {Admin,IAdmin} from "../../../models/admin/adminModel"
import IAdminOwnerRepository from "../../interfaces/admin/IAdminOwnerRepository";
import { BaseRepository } from "../../base/BaseRepository";
import {CarOwner,ICarOwner} from "../../../models/carowner/carOwnerModel"
import { Car, ICar } from "../../../models/car/carModel";
import { Booking,IBooking } from "../../../models/booking/bookingModel";
import { PipelineStage } from "mongoose";
import { buildSearchQuery } from "../../../utils/queryUtils";



class AdminOwnerRepository extends BaseRepository<IAdmin> implements IAdminOwnerRepository {
     constructor(){
        super(Admin);
     }

    // async getAllOwnerVerify(page: number,limit: number,search: string):Promise<{ carOwners: ICarOwner[]; total: number }> {
    //     try {
    //         console.log("reached ,,,,6");
    //         const carowners = await CarOwner.find({processStatus:2,verifyStatus:0}, "-password -refreshToken");
    //         console.log("Customers fetched:", carowners);
    //         if (!carowners || !Array.isArray(carowners)) {  
    //             console.error("No customers found or invalid format.");
    //             return [];
    //         }
    //         return carowners;
    //     } catch (error) {
    //         console.error("Error in getAllOwners:", error);
    //         throw new Error("Database query failed");
    //     }
    // }

    async getAllOwnerforVerify(page: number,limit: number,search: string): Promise<{ carOwners: ICarOwner[]; total: number }> {
  try {
    //  .filter((user: any) => user.processStatus > 0 && user.verifyStatus === 0)
    const filter = { processStatus:1, verifyStatus: 0, ...buildSearchQuery(search, ["fullName", "email", "phoneNumber"]) };
    
    const carOwners = await CarOwner.find(filter, "-password -refreshToken")
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await CarOwner.countDocuments(filter);

    return { carOwners, total };
  } catch (error) {
    console.error("Error in getAllOwnerVerify:", error);
    throw new Error("Database query failed");
  }
}


    // async getAllCarsVerify(page: number,limit: number,search: string):Promise<{ cars: ICar[]; total: number }>{
    //     try {
    //         console.log("reached ,,,,6");
    //         const cars = await Car.find().populate('owner', 'fullName email phoneNumber');
    //         console.log("Customers fetched:", cars);
    //         if (!cars || !Array.isArray(cars)) {  
    //             console.error("No customers found or invalid format.");
    //             return [];
    //         }
    //         return cars;
    //     } catch (error) {
    //         console.error("Error in getAllOwners:", error);
    //         throw new Error("Database query failed");
    //     }
    // }
    

    async getAllCarsforVerify(
  page: number,
  limit: number,
  search: string
): Promise<{ cars: ICar[]; total: number }>{
  try {
    const filter = {verifyStatus:0,isDeleted: false,...buildSearchQuery(search, ["carName", "brand", "model"])};
    
    const cars = await Car.find(filter)
      .populate("owner", "fullName email phoneNumber")
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Car.countDocuments(filter);

    return {  cars, total };
  } catch (error) {
    console.error("Error in getAllCarsVerify:", error);
    throw new Error("Database query failed");
  }
}

    // async getAllVerifiedCars(page: number,limit: number,search: string):Promise<{ cars: ICar[]; total: number }>{
    //     const cars=await Car.find({
    //         verifyStatus: 1,
    //         isDeleted: false,
    //         available: true,
    //       })
    //       .populate('owner', 'fullName email phoneNumber');
    //       return cars
    // }


    async getAllVerifiedCars(page: number,limit: number,search: string): Promise<{ cars: ICar[]; total: number }>{
  try {
    const filter = {verifyStatus: 1,isDeleted: false,available: true,...buildSearchQuery(search, ["carName", "brand", "model"]),};

    const cars = await Car.find(filter)
      .populate("owner", "fullName email phoneNumber")
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Car.countDocuments(filter);

    return { cars, total };
  } catch (error) {
    console.error("Error in getAllVerifiedCars:", error);
    throw new Error("Database query failed");
  }
}

    // async getAllBookings(page: number,limit: number,search: string): Promise<{ bookings: IBooking[]; total: number }> {
    //     try {
    //         const query: any = {
    //   status: { $in: ['confirmed', 'cancelled'] },
    // };

    // console.log("search",search)
    
    // if (search) {
    //   query.$or = [
    //     { 'userId.fullName': { $regex: search, $options: 'i' } },
    //     { 'carOwnerId.fullName': { $regex: search, $options: 'i' } },
    //     { 'carId.carName': { $regex: search, $options: 'i' } },
    //   ];
    // }
    //         const bookings = await Booking.find(query)
    //           .populate({
    //             path: 'carOwnerId',
    //               select: '_id fullName email', 
    //           }).populate({
    //               path: 'userId',
    //               select: '_id fullName email', 
    //             })
    //             .populate({
    //               path: 'carId',
    //               select: '_id carName brand model', 
    //             })
    //             .sort({ createdAt: -1 })
    //             .skip((page - 1) * limit)
    //          .limit(limit);

    //         const total = await Booking.countDocuments(query);
    //           return { bookings, total };
    //     } catch (error) {
    //         console.error("Error in getAllBookings:", error);
    //         throw new Error("Database query failed");
    //     }
    // }

    async getAllBookings(page: number,limit: number,search: string): Promise<{ bookings: any[]; total: number }> {
        try {
            const match: any = {
            status: { $in: ['confirmed', 'cancelled'] },
            };

        if (search) {
            const regex = new RegExp(search, 'i');
            match.$or = [
        { bookingId: regex },
        { 'customer.fullName': regex },   
        { 'carOwner.fullName': regex },    
        { 'car.carName': regex },          
        { status: regex },
      ];
    }

   const pipeline: PipelineStage[] =  [
     
      {
        $lookup: {
          from: 'customers', 
          localField: 'userId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },

   
      {
        $lookup: {
          from: 'carowners', 
          localField: 'carOwnerId',
          foreignField: '_id',
          as: 'carOwner',
        },
      },
      { $unwind: '$carOwner' },

     
      {
        $lookup: {
          from: 'cars',
          localField: 'carId',
          foreignField: '_id',
          as: 'car',
        },
      },
      { $unwind: '$car' },

      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const bookings = await Booking.aggregate(pipeline);

  
    const totalPipeline = [
      ...pipeline.slice(0, 7), 
      { $count: 'total' },
    ];
    const totalResult = await Booking.aggregate(totalPipeline);

    return { bookings, total: totalResult[0]?.total || 0 };
  } catch (err) {
    console.error('Error in getAllBookings aggregation:', err);
    throw new Error('Failed to fetch bookings');
  }
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