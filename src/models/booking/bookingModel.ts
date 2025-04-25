
// import mongoose, { Document, Schema, Types } from 'mongoose';

// interface IBooking extends Document {
//   carId: Types.ObjectId;
//   userId: Types.ObjectId;
//   startDate: Date;
//   endDate: Date;
//   totalPrice: number;
//   status: 'confirmed' | 'pending' | 'cancelled'|' failed';
//   createdAt?: Date;
//   updatedAt?: Date;
//   paymentIntentId: string;
//   paymentMethod: 'stripe' |'wallet';  
// }

// const BookingSchema = new Schema<IBooking>(
//   {
//     carId: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
//     userId: { type: Schema.Types.ObjectId, ref: 'customer', required: true },
//     startDate: { type: Date, required: true },
//     endDate: { type: Date, required: true },
//     totalPrice: { type: Number, required: true },
//     status: {
//       type: String,
//       enum: ['confirmed', 'pending', 'cancelled','failed'],
//       default: 'pending',
//     },
//     paymentIntentId: {type:String},
//     paymentMethod: {
//       type:String,
//   }},
//   { timestamps: true }

// );

// const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

// export { IBooking, Booking };



import mongoose, { Document, Schema, Types } from 'mongoose';

interface IBooking extends Document {
  carId: Types.ObjectId;
  userId: Types.ObjectId;
  carOwnerId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'failed';
  paymentIntentId?: string;
  paymentMethod?: 'stripe' | 'wallet';
  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    carId: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    carOwnerId: { type: Schema.Types.ObjectId, ref: 'Owner', required: true },
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
      default: 'stripe',
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export { IBooking, Booking };
