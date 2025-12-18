export interface BookingDTO {
  id: string;
  carId: string;
  carName?: string;
  customerId: string;
  customerName?: string;
  carOwnerId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
