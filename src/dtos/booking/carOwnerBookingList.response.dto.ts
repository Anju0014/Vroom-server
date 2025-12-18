import { BookingDTO } from './booking.dto';
import { CarOwnerBookingDTO } from './carOwnerBooking.dto';

export interface CarOwnerBookingListResponseDTO {
  bookings: CarOwnerBookingDTO[];
  total: number;
}

export interface OwnerBookingListResponseDTO {
  bookings: BookingDTO[];
  total: number;
}
