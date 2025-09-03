
import mongoose, { Document, Schema, Types } from 'mongoose';

interface ILocation {
  lat: number;
  lng: number;
}
interface IBooking extends Document {
  bookingId:string,
  carId: Types.ObjectId;
  userId: Types.ObjectId;
  carOwnerId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'failed';
  paymentIntentId?: string;
  paymentMethod?: 'stripe' | 'wallet';
 cancellationFee :number
  refundedAmount :number,
 cancelledAt?:Date,
  createdAt?: Date;
  updatedAt?: Date;
  trackingToken: String,      
  trackingUrl: String, 
  currentLocation?: ILocation;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingId: { type: String, unique: true },
    carId: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'customer', required: true },
    carOwnerId: { type: Schema.Types.ObjectId, ref: 'CarOwner', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled', 'failed'],
      default: 'pending',
    },
    paymentIntentId: { type: String, default: null },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'wallet'],
    },
    cancellationFee:{type: Number},
    refundedAmount:{type: Number},
    cancelledAt:{type: Date},
    trackingToken: {type:String},      
    trackingUrl: {type:String}, 
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export { IBooking, Booking };
