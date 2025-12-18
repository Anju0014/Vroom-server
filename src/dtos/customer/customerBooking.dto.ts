export interface CustomerBookingDTO {
  id: string;

  carId: string;
  carName?: string;
  carImage?: string;

  startDate: Date;
  endDate: Date;
  totalPrice: number;

  status: string;

  refundedAmount?: number;
  cancellationFee?: number;
  cancelledAt?: Date;

  createdAt: Date;
}
