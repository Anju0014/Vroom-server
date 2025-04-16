
import mongoose, { Document, Schema, Types } from 'mongoose';

interface IBooking extends Document {
  carId: Types.ObjectId;
  userId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    carId: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'customer', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export { IBooking, Booking };
