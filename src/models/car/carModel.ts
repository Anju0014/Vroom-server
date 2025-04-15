// import mongoose, { Schema, Document } from "mongoose";

// interface ICar extends Document {
//   carName: string;
//   brand: string;
//   year?: string;
//   fuelType?: string;
//   rcBookNo?: string;
//   expectedWage: string;
//   location: {
//     address: string,
//     landmark:string,
//     coordinates: {
//       lat: number|null,
//       lng: number|null
//     }
//   },
//   make?: string;
//   carModel?: string; 
//   VerifyStatus?: number;
//   images: string[];  
//   videos?: string[]; 
//   owner: mongoose.Types.ObjectId; 
//   available?: boolean;
//   isDeleted?:boolean;
// }

// const CarSchema = new Schema<ICar>(
//   {
//     carName: { type: String, required: true },
//     brand: { type: String, required: true },
//     year: { type: String },
//     fuelType: { type: String, enum: ["Petrol", "Diesel", "Electric", "Hybrid"] },
//     rcBookNo: { type: String, unique: true },
//     expectedWage: { type: String, required: true },
//     location: {
//       address: {type:String},
//       landmark:{type:String},
//       coordinates: {
//         lat: {type:Number},
//         lng: {type:Number}
//       }
//     },
//     make: { type: String },
//     carModel: { type: String }, 
//     VerifyStatus: { type: Number, default: 0 },
//     images: { type: [String], required: true },
//     videos: { type: [String], default: [] },
//     owner: { type: Schema.Types.ObjectId, ref: "CarOwner", required: true },
//     available: { type: Boolean, default: true },
//     isDeleted: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true }
// );

// const Car = mongoose.model<ICar>("Car", CarSchema);
// export { Car, ICar };


import mongoose, { Schema, Document } from "mongoose";

interface ICar extends Document {
  carName: string;
  brand: string;
  year?: string;
  fuelType?: "Petrol" | "Diesel" | "Electric" | "Hybrid";
  rcBookNo?: string;
  expectedWage: string;
  location: {
    address: string;
    landmark: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // [lng, lat]
    };
  };
  make?: string;
  carModel?: string;
  verifyStatus?: number;
  images: string[];
  videos?: string[];
  owner: mongoose.Types.ObjectId;
  available?: boolean;
  isDeleted?: boolean;
  rejectionReason:string;
}

const CarSchema = new Schema<ICar>(
  {
    carName: { type: String, required: true },
    brand: { type: String, required: true },
    year: { type: String },
    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid"]
    },
    rcBookNo: { type: String, unique: true },
    expectedWage: { type: String, required: true },
    location: {
      address: { type: String, required: true },
      landmark: { type: String, required: true },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point"
        },
        coordinates: {
          type: [Number], // [lng, lat]
          required: true
        }
      }
    },
    make: { type: String },
    carModel: { type: String },
    verifyStatus: { type: Number, default: 0 },
    images: { type: [String], required: true },
    videos: { type: [String], default: [] },
    owner: { type: Schema.Types.ObjectId, ref: "CarOwner", required: true },
    available: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    rejectionReason :{type:String}
  },
  { timestamps: true }
);


CarSchema.index({ "location.coordinates": "2dsphere" });

const Car = mongoose.model<ICar>("Car", CarSchema);
export { Car, ICar };
