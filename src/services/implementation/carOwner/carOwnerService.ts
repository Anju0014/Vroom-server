import ICarOwnerRepository from "../../../repositories/interfaces/carowner/ICarOwnerRepository";
import { ICarOwnerService } from "../../interfaces/carOwner/ICarOwnerServices";
import { sendOTP,sendResetEmail } from "../../../utils/emailconfirm";
import { ICarOwner } from "../../../models/carowner/carOwnerModel";
import PasswordUtils from "../../../utils/passwordUtils";
import JwtUtils from "../../../utils/jwtUtils";
import { ICar } from "../../../models/car/carModel";
import mongoose from "mongoose";


class CarOwnerService implements ICarOwnerService {

    private _carOwnerRepository : ICarOwnerRepository;

    constructor(carOwnerRepository:ICarOwnerRepository){
        this._carOwnerRepository=carOwnerRepository
    }
    
   
async registerBasicDetails(carOwnerDetails: Partial<ICarOwner>): Promise<{ carOwner: ICarOwner }> {
    

    console.log("reached")
    const { fullName, email, password, phoneNumber } = carOwnerDetails;
    console.log(carOwnerDetails)

    if (!fullName || !email || !password) {
        console.log("here2 ")
        throw new Error("All fields are required")
    }


    const existingUser = await this._carOwnerRepository.findUserByEmail(carOwnerDetails.email!)

    if (existingUser) {
        console.log("User already exists. Throwing error...");
        throw new Error("Email already Exist")
    }

    const hashedPassword = await PasswordUtils.hashPassword(password)

 

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 5); 

    const carOwner = await this._carOwnerRepository.create({
        fullName,
        email,
        password: hashedPassword,
        phoneNumber,
        otp,
        otpExpires,
        status: 0
    })

    await sendOTP(email, otp)
    console.log("create new carOwner: ", carOwner);
    return { carOwner }
}


async otpVerify(email: string, otp: string): Promise<{ carOwner:ICarOwner }> {
    console.log("otp reached")
    console.log(`Verifying OTP for ${email}: ${otp}`);

   
    const carOwner = await this._carOwnerRepository.findUserByEmail(email);

    if (!carOwner) {
        throw new Error("User not found");
    }

    console.log("Fetched carOwner from DB:", carOwner);
    // if (customer.otp !== otp) {
    //     throw new Error("Invalid OTP");
    // }

    // if (new Date() > customer.otpExpires) {
    //     throw new Error("OTP Expired");
    // }
    if (!carOwner) {
        throw new Error("User not found");
    }

    if (!carOwner.otp || carOwner.otp !== otp) {
        throw new Error("Invalid OTP");
    }

    if (!carOwner.otpExpires || new Date() > carOwner.otpExpires) {
        throw new Error("OTP has expired");
    }
  
    carOwner.status = -1; 
    carOwner.otp = null;
    carOwner.otpExpires = null;

    await this._carOwnerRepository.updateCarOwner(carOwner._id.toString(), carOwner);


    console.log("User OTP verified successfully!");
    // return { success: true, message: "OTP Verified Successfully" };
    return {carOwner}
}


async resendOtp(email:string): Promise<{message:string}>{
   
    console.log(`Resending OTP for email: ${email}`);
    const carOwner=await this._carOwnerRepository.findUserByEmail(email);
    if(!carOwner){
        throw new Error("User not found");
    }
    const newOtp= Math.floor(100000+Math.random()*90000).toString();
    const otpExpires= new Date();
    otpExpires.setMinutes(otpExpires.getMinutes()+5);

    carOwner.otp=newOtp;
    carOwner.otpExpires=otpExpires;

    await this._carOwnerRepository.updateCarOwner(carOwner._id.toString(),carOwner);
    await sendOTP(carOwner.email,newOtp);
    console.log("New OTP sent Successfully");
    return {message:"OTP resend successfully"}
}

async loginCarOwner(email:string, password:string): Promise<{accessToken:string,refreshToken:string,carOwner:ICarOwner|null}>{
    console.log(`checking login things`);
    const carOwner=await this._carOwnerRepository.findUserByEmail(email);
    console.log(carOwner)
    if(!carOwner){
        console.log("not correct user")
        throw new Error("Invalid Credentials");
    }
    
    if (carOwner.status === -2) {
        throw new Error("This user is blocked by admin")
    }

    const passwordTrue = await PasswordUtils.comparePassword(password,carOwner.password)
    if(!passwordTrue){
        console.log("not correct")
        throw new Error("Invalid Credentials")
    }
    const accessToken=JwtUtils.generateAccessToken({id:carOwner._id, email:carOwner.email});
    const newRefreshToken=JwtUtils.generateRefreshToken({id:carOwner._id});

    this._carOwnerRepository.updateRefreshToken(carOwner._id.toString(), newRefreshToken);


    return {accessToken,refreshToken:newRefreshToken,carOwner}
}

async renewAuthToken(oldRefreshToken:string):Promise<{accessToken:string,refreshToken:string}>{
    
        const decoded = JwtUtils.verifyToken(oldRefreshToken, true)
    
        console.log("did reach")
        if (!decoded || typeof decoded === 'string' || !decoded.id) {
            console.log("error heree")
            throw new Error("Invalid refresh token");
        }

        const carOwner = await this._carOwnerRepository.findById(decoded.id);
        console.log(carOwner)
        console.log(carOwner?.refreshToken)
        console.log(oldRefreshToken)
        if (!carOwner || carOwner.refreshToken !== oldRefreshToken) {
            
            console.log("error here77e")
            throw new Error("Invalid refresh token")
        }
        const accessToken=JwtUtils.generateAccessToken({id:carOwner._id,email:carOwner.email});
        const refreshToken=JwtUtils.generateRefreshToken({id:carOwner._id});
        await this._carOwnerRepository.updateRefreshToken(carOwner._id.toString(), refreshToken);
         
        return {accessToken,refreshToken}
    }

    async forgotPassword(email: string): Promise<void> {
        const carOwner = await this._carOwnerRepository.findUserByEmail(email);
        if (!carOwner) {
          throw new Error('User not found');
        }
        const resetToken = JwtUtils.generateResetToken({ userId: carOwner._id });
        await sendResetEmail(email, resetToken, 'carOwner');
      }
    async resetPassword  (token: string, newPassword: string, role: "customer" | "carOwner"):Promise<string>{
        console.log("reached pt 2")
        const decoded = JwtUtils.verifyResetToken(token);
      
        if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
          throw new Error("Invalid or expired token");
        }
        const hashedPassword = await PasswordUtils.hashPassword(newPassword)
        if (role === "carOwner") {
          await this._carOwnerRepository.updatePassword(decoded.userId, hashedPassword);
        }
        return "Password reset successful. Please log in.";
      };

    async logoutCarOwner(refreshToken: string): Promise<void> {
   
        const carOwner = await this._carOwnerRepository.findUserByRefreshToken(refreshToken);
      if (!carOwner) {
        throw new Error("User not found");
      }
      await this._carOwnerRepository.clearRefreshToken(carOwner._id.toString());
    }



    async loginOwnerGoogle(fullName: string, email: string,profileImage: string, provider: string, role?: string):Promise<{accessToken:string,refreshToken:string,carOwner:ICarOwner|null}> {
        console.log("helloooooooo")
        let carOwner = await this._carOwnerRepository.findUserByEmail(email);
      
        if (carOwner && carOwner.status === -2) {
          throw new Error("User is blocked.");
        }
      
        if (!carOwner) {
            carOwner = await this._carOwnerRepository.create({
            fullName,
            email,
            // googleId,
            profileImage,
            provider,
            // role: role || "customer", // Default to "customer" if role isn't provided
          });
        }
      
    
        const accessToken = JwtUtils.generateAccessToken({ id: carOwner._id, email: carOwner.email });
        const refreshToken = JwtUtils.generateRefreshToken({ id: carOwner._id });
      
        await this._carOwnerRepository.updateRefreshToken(carOwner._id.toString(), refreshToken);
        let carOwner2 = await this._carOwnerRepository.findUserByEmail(email);
        return { accessToken, refreshToken, carOwner };
      }


      async getOwnerProfile(ownerId: string):Promise<{carOwner:ICarOwner}> {
        const carOwner = await this._carOwnerRepository.findById(ownerId);
        if (!carOwner) throw new Error("Owner not found");
    
        return {carOwner};
      }


      async updateCarOwnerProfile(carOwnerId: string,updatedData: Partial<ICarOwner>): Promise<ICarOwner> {

        if (updatedData.phoneNumber && !/^\d{10}$/.test(updatedData.phoneNumber)) {
          throw new Error("Invalid phone number format. Must be 10 digits.");
        }
    
     
        if (updatedData.address) {
          const requiredFields = ["addressLine1", "city", "state", "postalCode", "country"];
          for (const field of requiredFields) {
            if (!(updatedData.address as any)[field]) {
              throw new Error(`Missing address field: ${field}`);
            }
          }
        }
    
        const updatedOwner = await this._carOwnerRepository.updateCarOwner(carOwnerId, updatedData);
        if (!updatedOwner) {
          throw new Error("Car owner not found or update failed.");
        }
    
        return updatedOwner;
      }

      async updateCarOwnerProfileId(carOwnerId: string,updatedData: Partial<ICarOwner>): Promise<ICarOwner> {

        console.log("id",updatedData.idProof)
        const updatedOwner = await this._carOwnerRepository.updateCarOwner(carOwnerId, updatedData);
        console.log("updatedOwner",updatedOwner)
        if (!updatedOwner) {
          console.log("error2")
          throw new Error("Car owner not found or update failed.");
        }
        return updatedOwner;
      }


      
async registerNewCar(carDetails: Partial<ICar>, ownerId: string): Promise<ICar> {
  console.log("registering car for owner",ownerId)
    if (!ownerId) throw new Error("Owner ID is required");
  
    const carData: Partial<ICar> = {
      ...carDetails,
      owner: new mongoose.Types.ObjectId(ownerId), // Ensure ObjectId is used
      images: carDetails.images && Array.isArray(carDetails.images) ? carDetails.images : [],
      videos: carDetails.videos && Array.isArray(carDetails.videos) ? carDetails.videos : [],
    };
  
    return await this._carOwnerRepository.createCar(carData);
  }


  async getCarsByOwner(ownerId: string): Promise<ICar[]> {
    return await this._carOwnerRepository.getCarsByOwner(ownerId);
  }
      
}

export default CarOwnerService





