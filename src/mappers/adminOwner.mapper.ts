import { ICarOwner } from '../models/carowner/carOwnerModel';
import { ICar } from '../models/car/carModel';
import { IBooking } from '../models/booking/bookingModel';

import { OwnerVerifyListItemDTO } from '../dto/adminOwner/owner-verify-list.response.dto';
import { CarVerifyListItemDTO } from '../dto/adminOwner/car-verify-list.response.dto';
import { BookingListItemDTO } from '../dto/adminOwner/booking-list.response.dto';

export class AdminOwnerMapper {
  // 👤 Owner
  static toOwnerVerifyDTO(owner: ICarOwner): OwnerVerifyListItemDTO {
    return {
      id: owner._id.toString(),
      fullName: owner.fullName,
      email: owner.email,
      phoneNumber: owner.phoneNumber,
      verifyStatus: owner.verifyStatus,
      blockStatus: owner.blockStatus,
      idVerified: owner.idVerified,
      rejectionReason: owner.rejectionReason,
      createdAt: owner.createdAt,
    };
  }

  // 🚗 Car
  static toCarVerifyDTO(car: ICar): CarVerifyListItemDTO {
    return {
      id: car._id.toString(),
      carName: car.carName,
      ownerId: car.owner.toString(),
      verifyStatus: car.verifyStatus,
      blockStatus: car.blockStatus,
      rejectionReason: car.rejectionReason,
      createdAt: car.createdAt,
    };
  }

  // 📦 Booking
  static toBookingDTO(booking: IBooking): BookingListItemDTO {
    return {
      id: booking._id.toString(),
      bookingId: booking.bookingId,
      customerId: booking.customer.toString(),
      carId: booking.car.toString(),
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      createdAt: booking.createdAt,
    };
  }
}
