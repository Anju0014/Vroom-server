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
  },

  toEntity(dto: Partial<BookingDTO>): Partial<IBooking> {
    return {
      _id: dto.id ? new mongoose.Types.ObjectId(dto.id) : undefined,
      bookingId: dto.bookingId,
      carId: dto.carId ? new mongoose.Types.ObjectId(dto.carId) : undefined,
      userId: dto.customerId ? new mongoose.Types.ObjectId(dto.customerId) : undefined,
      carOwnerId: dto.carOwnerId ? new mongoose.Types.ObjectId(dto.carOwnerId) : undefined,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      status: dto.status,
      totalPrice: dto.totalAmount,
      paymentIntentId: dto.paymentIntentId,
      paymentMethod: dto.paymentMethod,
      trackingToken: dto.trackingToken,
      trackingUrl: dto.trackingUrl,
      cancellationFee: dto.cancellationFee,
      refundedAmount: dto.refundedAmount,
      cancelledAt: dto.cancelledAt ? new Date(dto.cancelledAt) : undefined,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
      currentLocation: dto.tracking
        ? {
            lat: dto.tracking.lat,
            lng: dto.tracking.lng,
          }
        : undefined,
    };
  },
};

