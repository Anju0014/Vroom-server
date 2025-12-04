import mongoose, { Document, ObjectId, Schema } from 'mongoose';

interface IAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
interface ICarOwner extends Document {
  _id: ObjectId;
  fullName: string;
  email: string;
  phoneNumber: string;
  altPhoneNumber: string;
  password: string;
  isVerified: boolean;
  processStatus: number;
  verifyStatus: number;
  blockStatus: number;
  status: number;
  previousStatus: number | null;
  otp?: string | null;
  otpExpires?: Date | null;
  profileImage: string;
  googleId: string;
  provider: string;
  idProof: string;
  idVerified: boolean;
  address: IAddress;
  refreshToken: string;
  rejectionReason: string;
  role: 'carOwner';
  updatedAt?: Date;
  createdAt?: Date;
}

const CarOwnerSchema = new Schema<ICarOwner>(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
    },
    altPhoneNumber: {
      type: String,
    },
    password: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
    },
    role: {
      type: String,
      enum: ['carOwner'],
      default: 'carOwner',
    },
    processStatus: {
      type: Number,
      enum: [0, 1, 2, 3], // -2: Blocked, -1: Doc Not Verified, 0: Not Verified, 1: Doc Verified, 2: Verified
      default: 0,
    },
    blockStatus: {
      type: Number,
      enum: [0, 1], // -2: Blocked, -1: Doc Not Verified, 0: Not Verified, 1: Doc Verified, 2: Verified
      default: 0,
    },
    verifyStatus: {
      type: Number,
      enum: [-1, 0, 1], // -2: Blocked, -1: Doc Not Verified, 0: Not Verified, 1: Doc Verified, 2: Verified
      default: 0,
    },
    rejectionReason: {
      type: String,
    },
    status: {
      type: Number,
      enum: [-2, -1, 0, 1, 2], // -2: Blocked, -1: Doc Not Verified, 0: Not Verified, 1: Doc Verified, 2: Verified
      default: 0,
    },

    // ✅ To store previous status before blocking
    previousStatus: { type: Number, enum: [-1, 0, 1, 2], default: 0 },

    otp: { type: String, required: false },
    otpExpires: { type: Date, required: false, expires: 300 },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    refreshToken: { type: String },
    address: {
      addressLine1: { type: String },
      addressLine2: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    idProof: {
      type: String,
      required: false,
    },
    idVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
    },
  },
  { timestamps: true }
);

const CarOwner = mongoose.model<ICarOwner>('CarOwner', CarOwnerSchema);

export { ICarOwner, CarOwner };
