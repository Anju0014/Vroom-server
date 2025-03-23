import { ICustomer } from "../../../models/customer/customerModel";

export interface ICustomerService{
    registerBasicDetails(customerDetails:Partial<ICustomer>):Promise<{customer:ICustomer}>
    otpVerify(email: string, otp: string): Promise<{ customer:ICustomer }>;
    resendOtp(email: string): Promise<{ message: string }>;
    loginCustomer(email:string,password:string):Promise<{customer:ICustomer|null,refreshToken:string,accessToken:string}>
    renewAuthToken(oldRefreshToken:string):Promise<{accessToken:string,refreshToken:string}>
    forgotPassword(email: string): Promise<void> 
    resetPassword  (token: string, newPassword: string, role:string):Promise<string>
    logoutCustomer(refreshToken: string): Promise<void>
    loginCustomerGoogle(fullName: string, email: string, image: string, provider: string, role?: string) :Promise<{accessToken:string,refreshToken:string,customer:ICustomer|null}>
}




