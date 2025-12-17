// booking-list.response.dto.ts
export interface BookingListItemDTO {
  id: string;
  bookingId: string;
  customerId: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  status: string | number;
  createdAt?: Date;
}

export interface BookingListResponseDTO {
  bookings: BookingListItemDTO[];
  total: number;
}
