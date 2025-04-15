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
        processStatus: 0
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
  
    customer.processStatus = 2; 
    customer.verifyStatus = 1;
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

async loginCustomer(email:string, password:string): Promise<{customerAccessToken:string,refreshToken:string,customer:ICustomer|null}>{
    console.log(`checking login things`);
    const customer=await this._customerRepository.findUserByEmail(email);
    console.log(customer)
    if(!customer){
        console.log("not correct user")
        throw new Error("Invalid Credentials");
    }
    
    if (customer.blockStatus === 1) {
        throw new Error("This user is blocked by admin")
    }

    if(customer.processStatus === 0){
      throw new Error("Signup is not completed")
    }

//     if (user.status === 0) {
//         throw new Error("Signup is not completed")
//     }
    const passwordTrue = await PasswordUtils.comparePassword(password,customer.password)
    if(!passwordTrue){
        console.log("not correct")
        throw new Error("Invalid Credentials")
    }
    const customerAccessToken=JwtUtils.generateAccessToken({id:customer._id, email:customer.email,role:'customer'});
    const newRefreshToken=JwtUtils.generateRefreshToken({id:customer._id});

    await this._customerRepository.updateRefreshToken(customer._id.toString(), newRefreshToken);

    return {customerAccessToken,refreshToken:newRefreshToken,customer}
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




       async changePassword(customerId: string, passwordDetails: { oldPassword: string; newPassword: string }): Promise<string > {
              const { oldPassword, newPassword } = passwordDetails;
              console.log("reachedkjkkf")
          
         
              const customer = await this._customerRepository.findById(customerId);
              if (!customer) {
                console.log("ijhjebhigbhinjdsn")
                  throw new Error("Car Owner not found");
              }
      
              const passwordMatch = await PasswordUtils.comparePassword(oldPassword, customer.password);
              if (!passwordMatch) {
                console.log("jdjfu??")
                  throw new Error("Old password is incorrect" );
              }
      
              const hashedPassword = await PasswordUtils.hashPassword(newPassword);
      
              await this._customerRepository.updatePassword(customerId, hashedPassword);
           
              return "Password updated successfully" ;
          }
          
      


async logoutCustomer(refreshToken: string): Promise<void> {
    
    console.log("reached")
    console.log(refreshToken)
    const customer = await this._customerRepository.findUserByRefreshToken(refreshToken);
  if (!customer) {
    console.log("error no customer")
    throw new Error("User not found");
  }
  await this._customerRepository.clearRefreshToken(customer._id.toString());
}



async loginCustomerGoogle(fullName: string, email: string, profileImage: string, provider: string, role?: string):Promise<{customerAccessToken:string,refreshToken:string,customer:ICustomer|null}> {
 
   console.log(profileImage)
    console.log("helloooooooo")
    // let customer;
    let customer = await this._customerRepository.findUserByEmail(email);

    console.log("1//////////",customer)

    if (customer&& customer.blockStatus === 1) {
      throw new Error("User is blocked by the Admin .");
    }
  
    if (!customer) {
     customer = await this._customerRepository.create({
        fullName,
        email,
        profileImage,
        provider,
        processStatus:2,
        verifyStatus:1,
        // role: role || "customer", // Default to "customer" if role isn't provided
      });
    }

    const customerAccessToken = JwtUtils.generateAccessToken({ id: customer._id, email: customer.email,role:'customer' });
    const refreshToken = JwtUtils.generateRefreshToken({ id: customer._id });
  
    
    await this._customerRepository.updateRefreshToken(customer._id.toString(), refreshToken);
    console.log(refreshToken);
    let customer2 = await this._customerRepository.findUserByEmail(email);
    console.log(customer2)
    
    return { customerAccessToken, refreshToken, customer };
  }


    async getCustomerProfile(customerId: string):Promise<{customer:ICustomer}> {
        const customer = await this._customerRepository.findById(customerId);
        if (!customer) throw new Error("customer not found");
    
        return {customer};
      }


      async updateCustomerProfile(customerId: string,updatedData: Partial<ICustomer>): Promise<ICustomer> {

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
    
        const updatedcustomer = await this._customerRepository.updateCustomer(customerId, updatedData);
        if (!updatedcustomer) {
          throw new Error("Ccustomer not found or update failed.");
        }
    
        return updatedcustomer;
      }



      async updateCustomerProfileId(customerId: string,updatedData: Partial<ICustomer>): Promise<ICustomer> {

        console.log("id",updatedData.idProof)
        updatedData.processStatus=1;
        const updatedcustomer = await this._customerRepository.updateCustomer(customerId, updatedData);
        console.log("updatedcustomer",updatedcustomer)
        if (!updatedcustomer) {
          console.log("error2")
          throw new Error("Car customer not found or update failed.");
        }
        return updatedcustomer;
      }


}
export default CustomerService