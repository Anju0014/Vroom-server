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
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from "../../../config/s3Config";
import { Booking, IBooking } from "../../../models/booking/bookingModel";

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



async confirmBooking(bookingId: string, paymentIntentId: string): Promise<IBooking> {
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
  
  const updatedBooking = await this._customerCarRepository.saveBooking(booking);
  return updatedBooking;
  

}

// async generateAndUploadReceipt(bookingId: string) {
//   const booking = await Booking.findById(bookingId)
//     .populate("userId", "fullName email")
//     .populate("carOwnerId", "fullName phone")
//     .populate("carId", "carName brand rcBookNo location.address");

//   if (!booking) throw new Error("Booking not found");

//   const doc = new PDFDocument({ margin: 40, size: [595, 650] }); // Reduced height

//   const primaryBlue = '#1E40AF';
//   const accentYellow = '#FCD34D';
//   const darkGray = '#374151';
//   const lightGray = '#6B7280';

//   const buffer: Buffer = await new Promise((resolve, reject) => {
//     const chunks: Buffer[] = [];
//     doc.on('data', (chunk) => chunks.push(chunk));
//     doc.on('end', () => resolve(Buffer.concat(chunks)));
//     doc.on('error', reject);

//     // Header with colored bar
//     doc.rect(0, 0, doc.page.width, 90).fill(primaryBlue);

//     // Logo placeholder
//     doc.circle(60, 45, 25).fill(accentYellow);
//     doc.fontSize(20).fillColor('#FFFFFF').text('V', 50, 33);
//     doc.fontSize(24).fillColor('#FFFFFF').text('VROOM', 100, 30);
//     doc.fontSize(11).fillColor(accentYellow).text('Car Rental Services', 100, 58);
//     doc.fontSize(16).fillColor('#FFFFFF').text('RECEIPT', doc.page.width - 140, 35);

//     const statusColor = booking.status === 'cancelled' ? '#EF4444' : '#15e623ff';
//     doc.fontSize(10).fillColor(statusColor).text(booking.status.toUpperCase(), doc.page.width - 140, 58);
//     doc.fillColor(darkGray);

//     let yPos = 110;
//     doc.fontSize(10).fillColor(lightGray) .text('Booking ID:', 40, yPos);
//     doc.fontSize(12).fillColor(primaryBlue).font('Helvetica-Bold').text(booking.bookingId, 150, yPos);

//     yPos += 30;
//     const col1 = 40;
//     const col2 = 300;

//     doc.font('Helvetica-Bold').fontSize(11) .fillColor(primaryBlue) .text('CUSTOMER', col1, yPos);
//     doc.font('Helvetica-Bold').fontSize(11).fillColor(primaryBlue).text('VEHICLE', col2, yPos);

//     yPos += 20;

//     doc.font('Helvetica').fontSize(10).fillColor(darkGray).text(booking.userId?.fullName || 'N/A', col1, yPos);
//     doc.text(`${booking.carId?.brand || 'N/A'} ${booking.carId?.carName || ''}`, col2, yPos);

//     yPos += 15;

//     doc.fontSize(9) .fillColor(lightGray).text(booking.userId?.email || 'N/A', col1, yPos, { width: 240 });
//     doc.fillColor(darkGray) .text(booking.carId?.rcBookNo || 'N/A', col2, yPos);

//     yPos += 30;

//    doc.font('Helvetica-Bold').fontSize(11).fillColor(primaryBlue).text('RENTAL PERIOD', col1, yPos);

//    yPos += 20;

//   const startDate = new Date(booking.startDate).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });

//     const endDate = new Date(booking.endDate).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });

//     doc.font('Helvetica').fontSize(10).fillColor(darkGray).text(`${startDate}   TO   ${endDate}`, col1, yPos);

//     yPos += 30;

//     doc.font('Helvetica-Bold').fontSize(11).fillColor(primaryBlue).text('PICKUP LOCATION', col1, yPos);

//     yPos += 20;

//     doc.font('Helvetica').fontSize(10).fillColor(darkGray).text(booking.carId?.location?.address || 'N/A', col1, yPos, {
//         width: doc.page.width - 80
//       });

//     yPos += 35;

//     doc.rect(40, yPos, doc.page.width - 80, 45).fill(primaryBlue);
//     doc.fontSize(11).fillColor(accentYellow).font('Helvetica-Bold').text('TOTAL PAID', 50, yPos + 10);
//     doc.fontSize(20).fillColor('#FFFFFF').text(`${booking.totalPrice.toLocaleString('en-IN')}`, 50, yPos + 25);
//     doc.fontSize(8).fillColor('#FFFFFF').text(`Owner: ${booking.carOwnerId?.fullName || 'N/A'}`, doc.page.width - 180, yPos + 20);

//     yPos += 65;

//     doc.moveTo(40, yPos).lineTo(doc.page.width - 40, yPos).strokeColor(lightGray).lineWidth(0.5).stroke();
//     doc.fontSize(8).fillColor(lightGray).text('Thank you for choosing Vroom!', 40, yPos + 10, {align: 'center', width: doc.page.width - 80});
//     doc.fontSize(7).text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 40, yPos + 25, {align: 'center',width: doc.page.width - 80});

//     doc.end();
//   });

//   const key = `receipts/booking-${booking.bookingId}${
//     booking.status === 'cancelled' ? '-cancelled' : ''
//   }.pdf`;

//   await s3.send(new PutObjectCommand({
//     Bucket: process.env.AWS_S3_BUCKET_NAME!,
//     Key: key,
//     Body: buffer,
//     ContentType: 'application/pdf',
//   }));

//   const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
//   booking.receiptUrl = fileUrl;
//   await booking.save();

//   return fileUrl;
// }


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




    
          
}
export default CustomerCarAndBookingService



 

