import ICarOwnerRepository from "../../../repositories/interfaces/carOwner/ICarOwnerRepository";
import { ICarOwnerService } from "../../interfaces/carOwner/ICarOwnerServices";
import { sendEmail,sendResetEmail } from "../../../utils/emailconfirm";
import { ICarOwner } from "../../../models/carowner/carOwnerModel";
import PasswordUtils from "../../../utils/passwordUtils";
import JwtUtils from "../../../utils/jwtUtils";
import { ICar } from "../../../models/car/carModel";
import mongoose from "mongoose";
import { otpTemplate, passwordResetTemplate } from "../../../templates/emailTemplates";

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
        processStatus: 0
    })

    const otpContent = otpTemplate(otp);
        await sendEmail({ to: email, ...otpContent });
    // await sendOTP(email, otp)
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
  
    carOwner.processStatus = 1; 
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

    const otpContent = otpTemplate(newOtp);
    await sendEmail({ to: carOwner.email, ...otpContent });
    // await sendOTP(carOwner.email,newOtp);
    console.log("New OTP sent Successfully");
    return {message:"OTP resend successfully"}
}

async loginCarOwner(email:string, password:string): Promise<{ownerAccessToken:string,refreshToken:string,carOwner:ICarOwner|null}>{
    console.log(`checking login things`);
    const carOwner=await this._carOwnerRepository.findUserByEmail(email);
    console.log(carOwner)
    if(!carOwner){
        console.log("not correct user")
        throw new Error("Invalid Credentials");
    }
    
    if (carOwner.processStatus < 1) {
      throw new Error("Not a  verified User")
  }

    if (carOwner.blockStatus === 1) {
        throw new Error("This user is blocked by admin")
    }

    const passwordTrue = await PasswordUtils.comparePassword(password,carOwner.password)
    if(!passwordTrue){
        console.log("not correct")
        throw new Error("Invalid Credentials")
    }
    const ownerAccessToken=JwtUtils.generateAccessToken({id:carOwner._id, email:carOwner.email,role:'carOwner'});
    const newRefreshToken=JwtUtils.generateRefreshToken({id:carOwner._id});

    this._carOwnerRepository.updateRefreshToken(carOwner._id.toString(), newRefreshToken);


    return {ownerAccessToken,refreshToken:newRefreshToken,carOwner}
}

// async renewAuthToken(oldRefreshToken:string):Promise<{accessToken:string,refreshToken:string}>{
    
//         const decoded = JwtUtils.verifyToken(oldRefreshToken, true)
    
//         console.log("did reach")
//         if (!decoded || typeof decoded === 'string' || !decoded.id) {
//             console.log("error heree")
//             throw new Error("Invalid refresh token");
//         }

//         const carOwner = await this._carOwnerRepository.findById(decoded.id);
//         console.log(carOwner)
//         console.log(carOwner?.refreshToken)
//         console.log(oldRefreshToken)
//         if (!carOwner || carOwner.refreshToken !== oldRefreshToken) {
            
//             console.log("error here77e")
//             throw new Error("Invalid refresh token")
//         }
//         const accessToken=JwtUtils.generateAccessToken({id:carOwner._id,email:carOwner.email, role:'owner'});
//         const refreshToken=JwtUtils.generateRefreshToken({id:carOwner._id});
//         await this._carOwnerRepository.updateRefreshToken(carOwner._id.toString(), refreshToken);
         
//         return {accessToken,refreshToken}
//     }

async renewAuthToken(oldRefreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
  const decoded = JwtUtils.verifyToken(oldRefreshToken, true);

  console.log("Decoded refresh token:", decoded);

  // Handle token verification results
  if (!decoded || typeof decoded === "string") {
    console.log("Invalid or malformed refresh token");
    throw new Error("Invalid refresh token");
  }
  if (decoded.message === "Token expired") {
    console.log("Refresh token has expired");
    throw new Error("Refresh token expired");
  }
  if (!decoded.id) {
    console.log("No ID in refresh token payload");
    throw new Error("Invalid refresh token");
  }

  const carOwner = await this._carOwnerRepository.findById(decoded.id);
  console.log("Car owner:", carOwner);
  console.log("Stored refresh token:", carOwner?.refreshToken);
  console.log("Provided refresh token:", oldRefreshToken);

  if (!carOwner || carOwner.refreshToken !== oldRefreshToken) {
    console.log("Refresh token mismatch or user not found");
    throw new Error("Invalid refresh token");
  }

  const accessToken = JwtUtils.generateAccessToken({ id: carOwner._id, email: carOwner.email, role: "carOwner" });
  const refreshToken = JwtUtils.generateRefreshToken({ id: carOwner._id });
  await this._carOwnerRepository.updateRefreshToken(carOwner._id.toString(), refreshToken);

  return { accessToken, refreshToken };
}



    async completeRegister(ownerId:string,ownerDetails:Partial<ICarOwner>):Promise<ICarOwner>{
      const carOwner=await this._carOwnerRepository.findById(ownerId);
      if(!carOwner){
        throw new Error('Owner Not Found')
      }

      if (ownerDetails.phoneNumber && !/^\d{10}$/.test(ownerDetails.phoneNumber)) {
        throw new Error("Invalid phone number format. Must be 10 digits.");
      }
  
   
      if (ownerDetails.address) {
        const requiredFields = ["addressLine1", "city", "state", "postalCode", "country"];
        for (const field of requiredFields) {
          if (!(ownerDetails.address as any)[field]) {
            throw new Error(`Missing address field: ${field}`);
          }
        }
      }
      ownerDetails.processStatus = 2;

      const updatedOwner = await this._carOwnerRepository.updateCarOwner(ownerId, ownerDetails);
      if (!updatedOwner) {
        throw new Error("Car owner not found or update failed.");
      }

     updatedOwner.processStatus =2;

      return updatedOwner;
    }


    async forgotPassword(email: string): Promise<void> {
        const carOwner = await this._carOwnerRepository.findUserByEmail(email);
        if (!carOwner) {
          throw new Error('User not found');
        }
        const resetToken = JwtUtils.generateResetToken({ userId: carOwner._id });

        await sendResetEmail(carOwner.email, carOwner.fullName, resetToken, 'carOwner');
        // await sendResetEmail(email, resetToken, 'carOwner');
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




      async changePassword(ownerId: string, passwordDetails: { oldPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
        const { oldPassword, newPassword } = passwordDetails;
    
   
        const carOwner = await this._carOwnerRepository.findById(ownerId);
        if (!carOwner) {
            throw new Error("Car Owner not found");
        }

        const passwordMatch = await PasswordUtils.comparePassword(oldPassword, carOwner.password);
        if (!passwordMatch) {
            return { success: false, message: "Old password is incorrect" };
        }

        const hashedPassword = await PasswordUtils.hashPassword(newPassword);

        await this._carOwnerRepository.updatePassword(ownerId, hashedPassword);
    
        return { success: true,message: "Password updated successfully" };
    }
    


    async logoutCarOwner(refreshToken: string): Promise<void> {
   
        const carOwner = await this._carOwnerRepository.findUserByRefreshToken(refreshToken);
      if (!carOwner) {
        throw new Error("User not found");
      }
      await this._carOwnerRepository.clearRefreshToken(carOwner._id.toString());
    }



    async loginOwnerGoogle(fullName: string, email: string,profileImage: string, provider: string, role?: string):Promise<{ownerAccessToken:string,refreshToken:string,carOwner:ICarOwner|null}> {
        console.log("helloooooooo")
        let carOwner = await this._carOwnerRepository.findUserByEmail(email);
      
        if (carOwner && carOwner.blockStatus === 1) {
          throw new Error("User is blocked by the Admin.");
        }
      
        if (!carOwner) {
            carOwner = await this._carOwnerRepository.create({
            fullName,
            email,
            // googleId,
            profileImage,
            provider,
            processStatus:1,
            // role: role || "customer", // Default to "customer" if role isn't provided
          });
        }
      
    
        const ownerAccessToken = JwtUtils.generateAccessToken({ id: carOwner._id, email: carOwner.email,role:'carOwner' });
        const refreshToken = JwtUtils.generateRefreshToken({ id: carOwner._id });
      
        await this._carOwnerRepository.updateRefreshToken(carOwner._id.toString(), refreshToken);
        let carOwner2 = await this._carOwnerRepository.findUserByEmail(email);
        return { ownerAccessToken, refreshToken, carOwner };
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



      // async updateCarOwnerProfileId(carOwnerId: string,updatedData: Partial<ICarOwner>): Promise<ICarOwner> {

      //   console.log("id",updatedData.idProof)
      //   const updatedOwner = await this._carOwnerRepository.updateCarOwner(carOwnerId, updatedData);
      //   console.log("updatedOwner",updatedOwner)
      //   if (!updatedOwner) {
      //     console.log("error2")
      //     throw new Error("Car owner not found or update failed.");
      //   }
      //   return updatedOwner;
      // }


      

}

export default CarOwnerService





