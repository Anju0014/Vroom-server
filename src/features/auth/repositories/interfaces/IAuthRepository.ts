import { ICustomer } from "../../../../models/customer/customerModel";
import { ICarOwner } from "../../../../models/carowner/carOwnerModel";
import { IAdmin } from "../../../../models/admin/adminModel";

export interface IAuthRepository {
//   registerBasicDetails(data: Partial<ICustomer | ICarOwner>, role: string): Promise<ICustomer | ICarOwner>;
//   findByEmail(email: string, role: string): Promise<ICustomer | ICarOwner | IAdmin| null>;
//   verifyOtp(email: string, otp: string, role: string): Promise<ICustomer | ICarOwner | null>;
//   resendOtp(email: string, role: string): Promise<ICustomer | ICarOwner | null>;
//   completeRegistration(userId: string, data: Partial<ICustomer | ICarOwner>, role: string): Promise<ICustomer | ICarOwner>;
//   forgotPassword(email: string, role: string): Promise<void>;
//   resetPassword(token: string, newPassword: string, role: string): Promise<string>;
//   changePassword(userId: string, oldPassword: string, newPassword: string, role: string): Promise<{ success: boolean; message: string }>;
//   logout(refreshToken: string, role: string): Promise<void>;
//   loginGoogle(fullName: string, email: string, profileImage: string, provider: string, role: string): Promise<ICustomer | ICarOwner>;
//   renewAuthToken(refreshToken: string, role: string): Promise<{ accessToken: string; refreshToken: string }>;
// }



  registerBasicDetails(data: Partial<ICustomer | ICarOwner>, role: string): Promise<ICustomer | ICarOwner>;
  findByEmail(email: string, role: string): Promise<ICustomer | ICarOwner | IAdmin | null>;
  verifyOtp(email: string, otp: string, role: string): Promise<ICustomer | ICarOwner | null>;
  resendOtp(email: string, role: string): Promise<ICustomer | ICarOwner | null>;
  completeRegistration(userId: string, data: Partial<ICustomer | ICarOwner>, role: string): Promise<ICustomer | ICarOwner>;
  forgotPassword(email: string, role: string): Promise<void>;
  resetPassword(token: string, newPassword: string, role: string): Promise<string>;
  changePassword(userId: string, oldPassword: string, newPassword: string, role: string): Promise<{ success: boolean; message: string }>;
  logout(refreshToken: string, role: string): Promise<void>;
  loginGoogle(fullName: string, email: string, profileImage: string, provider: string, role: string): Promise<ICustomer | ICarOwner>;
  renewAuthToken(refreshToken: string, role: string): Promise<{ accessToken: string; refreshToken: string }>;
}