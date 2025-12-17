export interface CarOwnerBookingDTO {
  id: string;
  carId: string;
  carName?: string;
  customerId: string;
  startDate: Date;
  endDate: Date;
  bookingStatus: number;
  totalAmount: number;
  createdAt?: Date;
}
