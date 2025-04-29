import {Customer,ICustomer} from "../../../models/customer/customerModel"
import ICustomerDashBoardRepository from "../../interfaces/customer/ICustomerDashBoardRepository";
import { BaseRepository } from "../../base/BaseRepository";
import {Booking,IBooking} from "../../../models/booking/bookingModel"
import mongoose from "mongoose";
import { BookingUserData } from "../../../types/bookingData";
import { HydratedDocument } from "mongoose";
import { Wallet,IWallet } from "../../../models/wallet/walletModel";



class CustomerDashBoardRepository extends BaseRepository<ICustomer> implements ICustomerDashBoardRepository {

     constructor(){
        super(Customer);
     }


    //  async findBookingsByUserId (userId: string):Promise<any>{
    //     return await Booking.aggregate([
    //       {
    //         $match: {
    //           userId: new mongoose.Types.ObjectId(userId),
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: "cars",
    //           localField: "carId",
    //           foreignField: "_id",
    //           as: "carData",
    //         },
    //       },
    //       { $unwind: "$carData" },
    //       {
    //         $lookup: {
    //           from: "users",
    //           localField: "carOwnerId",
    //           foreignField: "_id",
    //           as: "ownerData",
    //         },
    //       },
    //       { $unwind: "$ownerData" },
    //       {
    //         $project: {
    //           _id: 1,
    //           carId: 1,
    //           userId: 1,
    //           carOwnerId: 1,
    //           startDate: 1,
    //           endDate: 1,
    //           totalPrice: 1,
    //           status: 1,
    //           createdAt: 1,
    //           carName: "$carData.carName",
    //           brand: "$carData.brand",
    //           pickupLocation: "$carData.location.address",
    //           carNumber: "$carData.rcBookNo",
    //           ownerName: "$ownerData.name",
    //           ownerContact: "$ownerData.phone",
    //         },
    //       },
    //     ]);
    //   };
      

    // async findBookingsByUserId(userId: string):Promise<any> {
    //     const bookings = await Booking.find({ userId })
    //       .populate({
    //         path: 'carId',
    //         select: 'carName brand rcBookNo location',
    //       })
    //       .populate({
    //         path: 'carOwnerId',
    //         select: 'name phone',
    //       });
      
    //     return bookings;
    //   }

    //     async findBookingsByUserId(userId: string):Promise<any> {
    //     const bookings = await Booking.find({ userId })
          

    //     return bookings;

    //   }
    async findBookingsByUserId(userId: string): Promise<any[]> {
        const bookings = await Booking.find({ userId })
          .populate({
            path: "carId",
            select: "carName brand location.address rcBookNo", 
          })
          .populate({
            path: "carOwnerId",
            select: "fullName phone", 
          })
          .lean(); // makes it a plain JS object
      
        return bookings.map(booking => ({
          _id: booking._id,
          bookingId:booking.bookingId,
          carId: booking.carId._id,
          userId: booking.userId,
          carOwnerId: booking.carOwnerId._id,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalPrice: booking.totalPrice,
          status: booking.status,
          createdAt: booking.createdAt,
          carName: booking.carId.carName,
          brand: booking.carId.brand,
          pickupLocation: booking.carId.location.address,
          carNumber: booking.carId.rcBookNo,
          ownerName: booking.carOwnerId.fullName,
          ownerContact: booking.carOwnerId.phone,
        }));
      }
      

      
            async findBookingById(bookingId: string): Promise<IBooking | null> {
              return Booking.findById(bookingId);
            }
          
           
            async saveBooking(bookingData: HydratedDocument<IBooking>): Promise<IBooking> {
              console.log("reached for save")
              let booking= await bookingData.save();
              console.log(booking);
              return booking
            }


async logWalletTransaction(
    userId: string,
    type: string, // 'refund', 'payment', 'cancellation'
    amount: number,
    description: string
  ): Promise<void> {
    const transaction = {
      type,
      amount,
      description,
    };
    
    await Wallet.updateOne(
      { userId },
      { $push: { transactions: transaction } }
    );
    console.log('Transaction logged:', transaction);
  }
  

async findWalletByUserId(userId: string): Promise<IWallet | null> {
    return Wallet.findOne({ userId });
  }



async createWallet(userId: string): Promise<IWallet> {
    const wallet = new Wallet({
      userId,
      balance: 0,
      transactions: [],
    });
    await wallet.save();
    console.log('Wallet created for userId:', userId);
    return wallet;
  }



async saveWallet(wallet: IWallet): Promise<IWallet|null> {
    return Wallet.findOneAndUpdate({ userId: wallet.userId }, wallet, { new: true });
  }


// async saveBooking(booking: IBooking): Promise<IBooking|null> {
//     return Booking.findOneAndUpdate({ bookingId: booking.bookingId }, booking, { new: true });
//   }
        

    
            
}
export default CustomerDashBoardRepository
