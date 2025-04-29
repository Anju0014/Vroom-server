import ICustomerDashBoardRepository from "../../../repositories/interfaces/customer/ICustomerDashBoardRepository";
import { ICustomerDashBoardService } from "../../interfaces/customer/ICustomerDashBoardServices";
import { ICar } from "../../../models/car/carModel";
import { BookingData, BookingUserData } from "../../../types/bookingData";
import mongoose from "mongoose";
import {stripe}  from '../../../config/stripeConfig'; 

class CustomerDashBoardService implements ICustomerDashBoardService {

    private _customerDashRepository : ICustomerDashBoardRepository;

    constructor(customerDashRepository:ICustomerDashBoardRepository){
        this._customerDashRepository=customerDashRepository
    }

    async getCustomerBookings (userId: string):Promise<any> {
        const bookings=await this._customerDashRepository.findBookingsByUserId(userId);
    console.log("bookings->>>", bookings);
    return bookings
        // const bookings = await this._customerDashRepository.findBookingsByUserId(userId);
        
        // return bookings.map((booking:any) => ({
        //     _id: booking._id,
        //     carId: booking.carId._id,
        //     userId: booking.userId,
        //     carOwnerId: booking.carOwnerId._id,
        //     startDate: booking.startDate,
        //     endDate: booking.endDate,
        //     totalPrice: booking.totalPrice,
        //     status: booking.status,
        //     createdAt: booking.createdAt,
        //     carName: (booking.carId as any).carName,
        //     brand: (booking.carId as any).brand,
        //     pickupLocation: (booking.carId as any).location.address,
        //     carNumber: (booking.carId as any).rcBookNo,
        //     ownerName: (booking.carOwnerId as any).name,
        //     ownerContact: (booking.carOwnerId as any).phone,
        //   }));
  
    };

      
    // async cancelBooking(bookingId: string): Promise<void> {
    //     console.log("Starting cancel booking for:", bookingId);
      
    //     const booking = await this._customerDashRepository.findBookingById(bookingId);
    //     if (!booking || booking.status !== 'confirmed') {
    //       console.error("Booking invalid or not confirmed");
    //       throw new Error('Invalid or non-confirmed booking');
    //     }
      
    //     try {
    //       console.log("Booking found:", booking);
    //       booking.status = 'cancelled';
    //       booking.updatedAt = new Date(); // if you use timestamps
    //       console.log("Booking before save:", booking);
      
    //       const validated = await booking.validate(); // manually check
    //       console.log("Validation success:", validated);
      
    //       let bookingAfterSave = await this._customerDashRepository.saveBooking(booking);
    //       console.log("Booking saved successfully:", bookingAfterSave);
      
    //     } catch (error) {
    //       console.error("Error during booking cancellation save:", error);
    //       throw new Error('Booking cancellation failed');
    //     }
    //   }

    async cancelBooking(bookingId: string): Promise<void> {
        // Check if the booking exists and its status
        const booking = await this._customerDashRepository.findBookingById(bookingId);
      
        if (!booking || booking.status !== 'confirmed') {
          throw new Error('Invalid or non-confirmed booking');
        }
      
        const totalAmount = booking.totalPrice;
        const cancellationFeeRate = 0.01; 
        const cancellationFee = Math.round(totalAmount * cancellationFeeRate);
        const refundAmount = totalAmount - cancellationFee;
      
        
        if (booking.paymentIntentId) {
          const refund = await stripe.refunds.create({
            payment_intent: booking.paymentIntentId,
            amount: refundAmount * 100,
          });
          console.log('Refund processed through Stripe:', refund.id);
      
          
          await this._customerDashRepository.logWalletTransaction(booking.userId.toString(), 'refund', refundAmount, `Refund for booking cancellation via Stripe`);
        }
      
        // Check if wallet exists for the customer
        let wallet = await this._customerDashRepository.findWalletByUserId(booking.userId.toString());
      
        if (!wallet) {
          // Create a new wallet if not found
          console.log('Wallet not found. Creating a new wallet...');
          wallet = await this._customerDashRepository.createWallet(booking.userId.toString());
        }
      if(wallet){
        // Add refund amount to the wallet balance
        wallet.balance += refundAmount;
        await this._customerDashRepository.saveWallet(wallet);
        console.log('Wallet updated with refund. New balance:', wallet.balance);
      
        // Log transaction for wallet update
        await this._customerDashRepository.logWalletTransaction(booking.userId.toString(), 'refund', refundAmount, `Refund added to wallet after cancellation`);
      
        // Mark the booking as cancelled
        booking.status = 'cancelled';
        booking.cancellationFee = cancellationFee;
        booking.refundedAmount = refundAmount;
        booking.cancelledAt = new Date();
        await this._customerDashRepository.saveBooking(booking);
      
        console.log('Booking cancelled and saved successfully.');}
      }
      
}
export default CustomerDashBoardService