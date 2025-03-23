import mongoose,{Document, ObjectId, Schema} from "mongoose";


interface ICustomer extends Document{
    _id:ObjectId;
    fullName:string;
    email:string;
    phoneNumber:string;
    password:string;
    isVerified:boolean;
    status:number;
    otp?:string|null;
    otpExpires?:Date|null;
    profilePic:string;
    googleId:string;
    provider:string;
    refreshToken:string;
    role:"customer";
    updatedAt?:Date;
    createdAt?: Date;
    
}

const CustomerSchema = new Schema<ICustomer>({
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
    profilePic:{
        type:String
    },
    role:{
        type:String,
        enum:["customer"],
        default:"customer"
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
    refreshToken: { type: String, default:null }
}, { timestamps: true })


const Customer = mongoose.model<ICustomer>("customer", CustomerSchema)

export { ICustomer, Customer };