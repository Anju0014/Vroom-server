import { BookingDTO } from '../dtos/booking/booking.dto';
import { IBooking } from '../models/booking/bookingModel';
import { generateViewRecieptPresignedUrl } from '../services/s3Service';

export async function toBookingDTO(booking: IBooking): Promise<BookingDTO> {
  let receiptUrl: string | undefined = undefined;

  if (booking.receiptKey) {
    try {
      receiptUrl = await generateViewRecieptPresignedUrl(booking.receiptKey);
    } catch (err) {
      console.error('Failed to generate receipt URL:', err);
    }
  }

  return {
    id: booking._id.toString(),
    carId: booking.carId.toString(),
    // carName: booking.carId.carName,
    customerId: booking.userId.toString(),
    // customerName: booking.userId.fullName,
    carOwnerId: booking.carOwnerId.toString(),
    startDate: booking.startDate,
    endDate: booking.endDate,
    totalPrice: booking.totalPrice,
    status: booking.status,
    receiptUrl,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

export async function toBookingDTOs(bookings: IBooking[]): Promise<BookingDTO[]> {
  return Promise.all(bookings.map((b) => toBookingDTO(b)));
}
