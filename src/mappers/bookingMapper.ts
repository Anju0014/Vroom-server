import { IBooking } from '../models/booking/bookingModel';
import mongoose from 'mongoose';

export interface BookingDTO {
  id: string;
  bookingId?: string;
  carId: string;
  customerId: string;
  carOwnerId: string;
  startDate: string;
  endDate: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'failed';
  totalAmount: number;
  paymentIntentId?: string;
  paymentMethod?: 'stripe' | 'wallet';
  trackingToken?: string;
  trackingUrl?: string;
  cancellationFee?: number;
  refundedAmount?: number;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
  tracking?: {
    lat: number;
    lng: number;
  };
  carDetails?: {
    carName: string;
    brand: string;
    pickupLocation: string;
    carNumber: string;
  };
  ownerDetails?: {
    fullName: string;
    phone: string;
    email?: string;
  };
}

export const bookingMapper = {
  toDTO(booking: IBooking & { _id: mongoose.Types.ObjectId }): BookingDTO {
    return {
      id: booking._id.toString(),
      bookingId: booking.bookingId,
      carId: booking.carId.toString(),
      customerId: booking.userId.toString(),
      carOwnerId: booking.carOwnerId.toString(),
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      status: booking.status,
      totalAmount: booking.totalPrice,
      paymentIntentId: booking.paymentIntentId,
      paymentMethod: booking.paymentMethod,
      trackingToken: booking.trackingToken ? String(booking.trackingToken) : undefined,
      trackingUrl: booking.trackingUrl ? String(booking.trackingUrl) : undefined,
      cancellationFee: booking.cancellationFee,
      refundedAmount: booking.refundedAmount,
      cancelledAt: booking.cancelledAt ? booking.cancelledAt.toISOString() : undefined,
      createdAt: booking.createdAt ? booking.createdAt.toISOString() : undefined,
      updatedAt: booking.updatedAt ? booking.updatedAt.toISOString() : undefined,
      tracking: booking.currentLocation
        ? {
            lat: booking.currentLocation.lat,
            lng: booking.currentLocation.lng,
          }
        : undefined,
      carDetails: booking.carId && typeof booking.carId === 'object' && 'carName' in booking.carId
        ? {
            carName: (booking.carId as any).carName,
            brand: (booking.carId as any).brand,
            pickupLocation: (booking.carId as any).location?.address || '',
            carNumber: (booking.carId as any).rcBookNo || '',
          }
        : undefined,
      ownerDetails: booking.carOwnerId && typeof booking.carOwnerId === 'object' && 'fullName' in booking.carOwnerId
        ? {
            fullName: (booking.carOwnerId as any).fullName,
            phone: (booking.carOwnerId as any).phone,
            email: (booking.carOwnerId as any).email,
          }
        : undefined,
    };
  }

} 