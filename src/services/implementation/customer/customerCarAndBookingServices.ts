import ICustomerCarAndBookingRepository from "../../../repositories/interfaces/customer/ICustomerCarAndBookingRepository";
import { ICustomerCarAndBookingService } from "../../interfaces/customer/ICustomerCarAndBookingServices";
import { ICar } from "../../../models/car/carModel";
import { BookingData,UpdateTrackingProps } from "../../../types/bookingData";
import mongoose from "mongoose";
import generateTrackingToken from "../../../utils/trackingIDGenerator";
import { getIO } from "../../../sockets/socket";
import { endOfDay } from "date-fns";
import PDFDocument from "pdfkit";
import stream from "stream";
import { S3 } from "../../../config/s3Config";
import { Booking } from "../../../models/booking/bookingModel";

class CustomerCarAndBookingService implements ICustomerCarAndBookingService {

    private _customerCarRepository : ICustomerCarAndBookingRepository;

    constructor(customerCarRepository:ICustomerCarAndBookingRepository){
        this._customerCarRepository=customerCarRepository
    }

    async getNearbyCars(lat: number, lng: number, maxDistance: number): Promise<ICar[]> {
        return this._customerCarRepository.findNearbyCars(lat, lng, maxDistance);
      }
    
      async getFeaturedCars(): Promise<ICar[]> {
        return this._customerCarRepository.findFeaturedCars();
      }
    
      async getCarDetail(carId: string): Promise<ICar | null> {
        return this._customerCarRepository.findCarById(carId);
      }
    
      async getBookedDateRanges(carId: string): Promise<{ start: Date; end: Date }[]> {
        return this._customerCarRepository.findBookedDates(carId);
      }




  async getAllCars(page: number, limit: number, filters: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    carType?:string;
    location?: string;
    startDate:string, 
    endDate:string
    // latitude?: number;
    // longitude?: number;
  }):Promise<ICar[]>  {
    return this._customerCarRepository.getAllCars(page, limit, filters);
  }

  async getCarsCount(filters: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    carType?:string;
    location?:string;
    startDate:string,
     endDate:string
    // latitude?: number;
    // longitude?: number;
  }):Promise<number>  {
    return this._customerCarRepository.getCarsCount(filters);
  }

      async createPendingBooking(bookingData: BookingData): Promise<string> {
  const { carId, startDate, endDate } = bookingData;
  
  if (!startDate || !endDate) {
    throw new Error('Start date and end date are required');
  }


  const car = await this._customerCarRepository.findCarById(carId);
  if (!car) {
    throw new Error('Car not found');
  }

  const start = new Date(startDate);
  const end = endOfDay(new Date(endDate)); 

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date format');
  }

  const conflict = await this._customerCarRepository.findConflictingBooking(carId,start,end);
  if (conflict) {
    throw new Error('Car is not available for the selected dates');
  }

  console.log("conflict",conflict)

//   const existingBooking = await  this._customerCarRepository.checkOldBooking(bookingData)


//   if (existingBooking &&  existingBooking._id) {
//     console.log("existingone")
//     return  existingBooking._id.toString() ;
//   }

console.log("create pending booking phase1")


  const booking = await this._customerCarRepository.createBooking({
    ...bookingData,
    startDate: start,
    endDate: end,
    status: 'pending',
  });
console.log("booking new pending",booking);
  if(!booking || !booking._id){
    throw new Error(' Error in Creating the Booking')
  }
  return booking._id.toString();
}



async confirmBooking(bookingId: string, paymentIntentId: string): Promise<void> {
  const booking = await this._customerCarRepository.findBookingById(bookingId);
  console.log("booking-old-confirm",booking)
  if (!booking || booking.status !== 'pending') {
    throw new Error('Invalid or non-pending booking');
  }

  booking.status = 'confirmed';
  booking.paymentIntentId = paymentIntentId;
  const newBookingId = await this._customerCarRepository.generateBookingId();
  booking.bookingId=newBookingId,

  console.log("old -confirm???",booking);
  const newbooking= await this._customerCarRepository.saveBooking(booking);
  console.log("newbooking-confirm", newbooking)
  const token = generateTrackingToken();
  const frontendUrl = process.env.FRONTEND_URL;
  const trackingUrl = `${frontendUrl}/customer/tracking/${bookingId}?token=${token}`;
  booking.trackingToken=token;
  booking.trackingUrl=trackingUrl;
  await this._customerCarRepository.saveBooking(booking);
  

}


async failedBooking(bookingId: string): Promise<void> {
    const booking = await this._customerCarRepository.findBookingById(bookingId);
    if (!booking || booking.status !== 'pending') {
      throw new Error('Invalid or non-pending booking');
    }
  
  
    // Option 1: update status
    booking.status = 'failed';
    await this._customerCarRepository.saveBooking(booking);
  
    
  }
  

// async updateTrackingLocation({bookingId,token,lat,lng,}: UpdateTrackingProps): Promise<void> {
//   const booking = await this._customerCarRepository.findBookingById(bookingId);
//   console.log(booking)
  
//   if (!booking || booking.trackingToken !== token) {
//     throw new Error("Unauthorized tracking link");
//   }

  
//   await this._customerCarRepository.updateBookingLocation(bookingId, { lat, lng });


//   const io = getIO();
//   console.log(`Emitting location to booking_${bookingId}:`, { lat, lng });
//   io.to(`booking_${bookingId}`).emit("location:update", { lat, lng });
// }

async updateTrackingLocation({ bookingId, token, lat, lng }: UpdateTrackingProps): Promise<void> {
  console.log("Updating location for booking:", bookingId, { lat, lng });
  const booking = await this._customerCarRepository.findBookingById(bookingId);
  console.log("Booking found:", booking);

  if (!booking || booking.trackingToken !== token) {
    console.error("Unauthorized tracking link for booking:", bookingId);
    throw new Error("Unauthorized tracking link");
  }

  await this._customerCarRepository.updateBookingLocation(bookingId, { lat, lng });
  console.log("Location updated in DB for booking:", bookingId);

  const io = getIO();
  console.log(`Emitting location to booking_${bookingId}:`, { lat, lng });
  io.to(`booking_${bookingId}`).emit("location:update", { lat, lng });
}


// src/services/bookingService.ts


export const generateAndUploadReceipt = async (booking: any) => {
  const doc = new PDFDocument();
  const bufferStream = new stream.PassThrough();
  doc.pipe(bufferStream);

  // Header
  doc.fontSize(20).text("Booking Receipt", { align: "center" });
  doc.moveDown();

  // Booking details
  doc.fontSize(12).text(`Booking ID: ${booking.bookingId}`);
  doc.text(`Customer Name: ${booking.customerName}`);
  doc.text(`Car: ${booking.carName} (${booking.brand})`);
  doc.text(
    `Booking Dates: ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`
  );
  doc.text(`Total Paid: ₹${booking.totalPrice}`);
  doc.text(`Pickup Location: ${booking.pickupLocation}`);
  doc.text(`Owner: ${booking.ownerName}`);
  doc.text(`Status: ${booking.status}`); // Confirmed / Cancelled

  doc.end();

  // Upload to S3
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: `receipts/booking-${booking.bookingId}${
      booking.status === "cancelled" ? "-cancelled" : ""
    }.pdf`,
    Body: bufferStream,
    ContentType: "application/pdf",
  };

  const result = await s3.upload(uploadParams).promise();
  booking.receiptUrl = result.Location;
  await booking.save();

  return result.Location;
};

    
          
}
export default CustomerCarAndBookingService



 

