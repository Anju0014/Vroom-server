import { IBooking } from '../models/booking/bookingModel';
import { CarOwnerBookingDTO } from '../dto/booking/car-owner-booking.dto';

export class BookingMapper {
  static toCarOwnerBookingDTO(booking: IBooking): CarOwnerBookingDTO {
    return {
      id: booking._id.toString(),
      carId: booking.car.toString(),
      carName: booking.carName,
      customerId: booking.customer.toString(),
      startDate: booking.startDate,
      endDate: booking.endDate,
      bookingStatus: booking.status,
      totalAmount: booking.totalAmount,
      createdAt: booking.createdAt,
    };
  }

  static toCarOwnerBookingDTOList(bookings: IBooking[]): CarOwnerBookingDTO[] {
    return bookings.map(this.toCarOwnerBookingDTO);
  }
}
