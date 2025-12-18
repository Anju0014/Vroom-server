import { CustomerBookingDTO } from './customerBooking.dto';

export interface CustomerBookingListResponseDTO {
  bookings: CustomerBookingDTO[];
  total: number;
}
