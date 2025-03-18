import ICustomerRepository from "../../../repositories/interfaces/customer/ICustomerRepository";
import { ICustomerService } from "../../interfaces/customer/ICustomerServices";
import { sendOTP,sendResetEmail } from "../../../utils/emailconfirm";
import { ICustomer } from "../../../models/customer/customerModel";
import PasswordUtils from "../../../utils/passwordUtils";
import JwtUtils from "../../../utils/jwtUtils";


class CustomerService implements ICustomerService {

    private _customerRepository : ICustomerRepository;

    constructor(customerRepository:ICustomerRepository){
        this._customerRepository=customerRepository
    }
    
   
async registerBasicDetails(customerDetails: Partial<ICustomer>): Promise<{ customer: ICustomer }> {
    

    console.log("reached")
    const { fullName, email, password, phoneNumber } = customerDetails;
    console.log(customerDetails)

    if (!fullName || !email || !password) {
        throw new Error("All fields are required")
    }


    const existingUser = await this._customerRepository.findUserByEmail(customerDetails.email!)

    if (existingUser) {
        console.log("User already exists. Throwing error...");
        throw new Error("Email already Exist")
    }

    const hashedPassword = await PasswordUtils.hashPassword(password)

 

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 5); 

    const customer = await this._customerRepository.create({
        fullName,
        email,
        password: hashedPassword,
        phoneNumber,
        otp,
        otpExpires,
        status: 0
    })

    await sendOTP(email, otp)
    console.log("create new customer: ", customer);


    return { customer }

}


async otpVerify(email: string, otp: string): Promise<{ customer:ICustomer }> {
    console.log("otp reached")
    console.log(`Verifying OTP for ${email}: ${otp}`);

   
    const customer = await this._customerRepository.findUserByEmail(email);

    if (!customer) {
        throw new Error("User not found");
    }

    console.log("Fetched customer from DB:", customer);
    // if (customer.otp !== otp) {
    //     throw new Error("Invalid OTP");
    // }

    // if (new Date() > customer.otpExpires) {
    //     throw new Error("OTP Expired");
    // }
    if (!customer) {
        throw new Error("User not found");
    }

    if (!customer.otp || customer.otp !== otp) {
        throw new Error("Invalid OTP");
    }

    if (!customer.otpExpires || new Date() > customer.otpExpires) {
        throw new Error("OTP has expired");
    }
  
    customer.status = 1; 
    customer.otp = null;
    customer.otpExpires = null;

    await this._customerRepository.updateCustomer(customer._id.toString(), customer);


    console.log("User OTP verified successfully!");
    // return { success: true, message: "OTP Verified Successfully" };
    return {customer}
}


async resendOtp(email:string): Promise<{message:string}>{
   
    console.log(`Resending OTP for email: ${email}`);
    const customer=await this._customerRepository.findUserByEmail(email);
    if(!customer){
        throw new Error("User not found");
    }
    const newOtp= Math.floor(100000+Math.random()*90000).toString();
    const otpExpires= new Date();
    otpExpires.setMinutes(otpExpires.getMinutes()+5);

    customer.otp=newOtp;
    customer.otpExpires=otpExpires;

    await this._customerRepository.updateCustomer(customer._id.toString(),customer);
    await sendOTP(customer.email,newOtp);
    console.log("New OTP sent Successfully");
    return {message:"OTP resend successfully"}
}

async loginCustomer(email:string, password:string): Promise<{accessToken:string,refreshToken:string,customer:ICustomer|null}>{
    console.log(`checking login things`);
    const customer=await this._customerRepository.findUserByEmail(email);
    console.log(customer)
    if(!customer){
        console.log("not correct user")
        throw new Error("Invalid Credentials");
    }
    
//     if (user.status === -1) {
//         throw new Error("This user is blocked by admin")
//     }
//     if (user.status === 0) {
//         throw new Error("Signup is not completed")
//     }
    const passwordTrue = await PasswordUtils.comparePassword(password,customer.password)
    if(!passwordTrue){
        console.log("not correct")
        throw new Error("Invalid Credentials")
    }
    const accessToken=JwtUtils.generateAccessToken({id:customer._id, email:customer.email});
    const newRefreshToken=JwtUtils.generateRefreshToken({id:customer._id});

    await this._customerRepository.updateRefreshToken(customer._id.toString(), newRefreshToken);

    return {accessToken,refreshToken:newRefreshToken,customer}
}

async renewAuthToken(oldRefreshToken:string):Promise<{accessToken:string,refreshToken:string}>{
    
        const decoded = JwtUtils.verifyToken(oldRefreshToken, true)

        if (!decoded || typeof decoded === 'string' || !decoded.id) {
            throw new Error("Invalid refresh token");
        }

        const customer = await this._customerRepository.findUserByEmail(decoded.id);
        if (!customer || customer.refreshToken !== oldRefreshToken) {
            throw new Error("Invalid refresh token")
        }
        const accessToken=JwtUtils.generateAccessToken({id:customer._id,email:customer.email});
        const refreshToken=JwtUtils.generateRefreshToken({id:customer._id});
        await this._customerRepository.updateRefreshToken(customer._id.toString(), refreshToken);
         
        return {accessToken,refreshToken}
    }

    async forgotPassword(email: string): Promise<void> {
        const customer = await this._customerRepository.findUserByEmail(email);
        if (!customer) {
          throw new Error('User not found');
        }
        const resetToken = JwtUtils.generateResetToken({ userId: customer._id });
        await sendResetEmail(email, resetToken, 'customer');
      }
    async resetPassword  (token: string, newPassword: string, role: "customer" | "carOwner"):Promise<string>{
        console.log("reached pt 2")
        const decoded = JwtUtils.verifyResetToken(token);
      
        if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
          throw new Error("Invalid or expired token");
        }
        const hashedPassword = await PasswordUtils.hashPassword(newPassword)
        if (role === "customer") {
          await this._customerRepository.updatePassword(decoded.userId, hashedPassword);
        }
        return "Password reset successful. Please log in.";
      };




async logoutCustomer(refreshToken: string): Promise<void> {
   
    const customer = await this._customerRepository.findUserByRefreshToken(refreshToken);
  if (!customer) {
    throw new Error("User not found");
  }
  await this._customerRepository.clearRefreshToken(customer._id.toString());
}

}
export default CustomerService