import mongoose,{Document, ObjectId, Schema} from "mongoose";


interface IAddress {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }
interface ICarOwner extends Document{
    _id:ObjectId;
    fullName:string;
    email:string;
    phoneNumber:string;
    password:string;
    isVerified:boolean;
    status:number;
    otp?:string|null;
    otpExpires?:Date|null;
    profileImage:string;
    googleId:string;
    provider:string;
    idProof:string;
    idVerified:false;
    address:IAddress;
    refreshToken:string;
    role:"carOwner";
    updatedAt?:Date;
    createdAt?: Date;
    
}

const CarOwnerSchema = new Schema<ICarOwner>({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    phoneNumber: {
        type: String,
    },
    password: {
        type: String,
        
    },
    isVerified: {
        type: Boolean, 
        default: false
    },
    profileImage:{
        type:String
    },
    role:{
        type:String,
        enum:["carOwner"],
        default:"carOwner"
    },
    status: {
        type: Number,
        enum: [-1, 0, 1],// -1 => blocked 0 => not verified 1 => verified
        default: 0
    },
    otp: { type: String, required: false },
    otpExpires: { type: Date, required: false, expires: 300 },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    refreshToken: { type: String },
    address: {
        addressLine1: { type: String },
        addressLine2: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String }
      },
      idProof: {
        type: String,
        required: false 
      },
      idVerified:{
        type:Boolean,
        default:false
      },
      provider:{
        type:String,
      }
}, { timestamps: true })


const CarOwner = mongoose.model<ICarOwner>("carowner", CarOwnerSchema)

export { ICarOwner, CarOwner };