import ICustomerCarAndBookingRepository from "../../../repositories/interfaces/customer/ICustomerCarAndBookingRepository";
import { ICustomerCarAndBookingService } from "../../interfaces/customer/ICustomerCarAndBookingServices";
import { ICar } from "../../../models/car/carModel";
import { BookingData } from "../../../types/bookingData";
import mongoose from "mongoose";

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
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date format');
  }

  const conflict = await this._customerCarRepository.findConflictingBooking(carId,start,end);
  if (conflict) {
    throw new Error('Car is not available for the selected dates');
  }

  console.log("conflict",conflict)

  const existingBooking = await  this._customerCarRepository.checkOldBooking(bookingData)


  if (existingBooking &&  existingBooking._id) {
    console.log("existingone")
    return  existingBooking._id.toString() ;
  }
  const booking = await this._customerCarRepository.createBooking({
    ...bookingData,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
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
  console.log("old -confirm???",booking);
 const newbooking= await this._customerCarRepository.saveBooking(booking);
 console.log("newbooking-confirm", newbooking)

}

async cancelBooking(bookingId: string): Promise<void> {
  const booking = await this._customerCarRepository.findBookingById(bookingId);
  if (!booking || booking.status !== 'pending') {
    throw new Error('Invalid or non-pending booking');
  }


  // Option 1: update status
  booking.status = 'failed';
  await this._customerCarRepository.saveBooking(booking);

  // Option 2 (alternative): await this._customerCarRepository.deleteBooking(bookingId);
}

    
          
}
export default CustomerCarAndBookingService



 

