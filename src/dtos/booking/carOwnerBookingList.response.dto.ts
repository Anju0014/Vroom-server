import { CarOwnerBookingDTO } from './carOwnerBooking.dto';

export interface CarOwnerBookingListResponseDTO {
  bookings: CarOwnerBookingDTO[];
  total: number;
}
