import mongoose, { Schema, Document } from "mongoose";

interface ICar extends Document {
  carName: string;
  brand: string;
  year?: string;
  fuelType?: string;
  rcBookNo?: string;
  expectedWage: string;
  location: string;
  make?: string;
  carModel?: string; // ✅ Renamed from "model" to "carModel" to avoid conflicts
  isVerified?: boolean;
  images: string[];  // Array of image URLs
  videos?: string[]; // Array of video URLs
  owner: mongoose.Types.ObjectId; // Link to car owner
  available?: boolean;
}

const CarSchema = new Schema<ICar>(
  {
    carName: { type: String, required: true },
    brand: { type: String, required: true },
    year: { type: String },
    fuelType: { type: String, enum: ["Petrol", "Diesel", "Electric", "Hybrid"] },
    rcBookNo: { type: String, unique: true },
    expectedWage: { type: String, required: true },
    location: { type: String, required: true },
    make: { type: String },
    carModel: { type: String }, // ✅ Changed from "model" to "carModel"
    isVerified: { type: Boolean, default: false },
    images: { type: [String], required: true },
    videos: { type: [String], default: [] },
    owner: { type: Schema.Types.ObjectId, ref: "CarOwner", required: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Car = mongoose.model<ICar>("Car", CarSchema);
export { Car, ICar };
