import ICustomerCarAndBookingRepository from "../../../repositories/interfaces/customer/ICustomerCarAndBookingRepository";
import { ICustomerCarAndBookingService } from "../../interfaces/customer/ICustomerCarAndBookingServices";
import { ICarOwnerBookingService } from "../../interfaces/carOwner/ICarOwnerBookingServices";

import ICarOwnerBookingRepository from "../../../repositories/interfaces/carOwner/ICarOwnerBookingRepository";
import { ICar } from "../../../models/car/carModel";
import { BookingData } from "../../../types/bookingData";
import mongoose from "mongoose";
import { IBooking } from "../../../models/booking/bookingModel";

class CarOwnerBookingService implements ICarOwnerBookingService {

    private _ownersBookingRepository : ICarOwnerBookingRepository;
    
    constructor(ownerBookingRepository:ICarOwnerBookingRepository){
        this._ownersBookingRepository=ownerBookingRepository
    }

    async getBookingsForCarOwner(carOwnerId: string): Promise<IBooking[]> {
        const bookings = await this._ownersBookingRepository.getBookingsForCarOwner(carOwnerId)
        return bookings;
      }
}
export default CarOwnerBookingService