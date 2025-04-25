export interface BookingData {
    carId: string;
    userId: string;
    carOwnerId: string;
    startDate: string | Date;
    endDate: string | Date;
    totalPrice: number;
    status: 'confirmed' | 'pending' | 'cancelled'|' failed';
    paymentIntentId?: string;
    paymentMethod?: 'stripe' | 'wallet';
  }