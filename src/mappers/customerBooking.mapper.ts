import { CustomerBookingDTO } from "../dtos/customer/customerBooking.dto";
import { IBooking } from "../models/booking/bookingModel";

export class CustomerBookingMapper {
  static toDTO(booking: IBooking): CustomerBookingDTO {
    return {
      id: booking._id.toString(),

      carId: booking.carId.toString(),
    //   carName: booking.carId.name,     // optional snapshot
    //   carImage: booking.carId?.image,

      startDate: booking.startDate,
      endDate: booking.endDate,
      totalPrice: booking.totalPrice,

      status: booking.status,

      refundedAmount: booking.refundedAmount,
      cancellationFee: booking.cancellationFee,
      cancelledAt: booking.cancelledAt,

      createdAt: booking.createdAt,
    };
  }

  static toDTOList(bookings: IBooking[]): CustomerBookingDTO[] {
    return bookings.map(this.toDTO);
  }
}
