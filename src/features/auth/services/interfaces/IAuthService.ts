import { ICustomer } from "../../../../models/customer/customerModel";
import { ICarOwner } from "../../../../models/carowner/carOwnerModel";
import { IAdmin } from "../../../../models/admin/adminModel";

// export interface IAuthService {
//   registerBasicDetails(data: Partial<ICustomer | ICarOwner>, role: string): Promise<{ customer?: ICustomer; carOwner?: ICarOwner }>;
//   verifyOtp(email: string, otp: string, role: string): Promise<{ customer?: ICustomer; carOwner?: ICarOwner }>;
//   resendOtp(email: string, role: string): Promise<ICustomer | ICarOwner | null>;
//   loginCustomer(email: string, password: string): Promise<{ customerAccessToken: string; refreshToken: string; customer: ICustomer | null }>;
//   loginCarOwner(email: string, password: string): Promise<{ ownerAccessToken: string; refreshToken: string; carOwner: ICarOwner | null }>;
//   loginCustomerGoogle(fullName: string, email: string, profileImage: string, provider: string, role: string): Promise<{ customerAccessToken: string; refreshToken: string; customer: ICustomer }>;
//   loginOwnerGoogle(fullName: string, email: string, profileImage: string, provider: string, role: string): Promise<{ ownerAccessToken: string; refreshToken: string; carOwner: ICarOwner }>;
//   renewAuthToken(refreshToken: string, role: string): Promise<{ accessToken: string; refreshToken: string }>;
//   completeRegistration(userId: string, data: Partial<ICustomer | ICarOwner>, role: string): Promise<ICustomer | ICarOwner>;
//   forgotPassword(email: string, role: string): Promise<void>;
//   resetPassword(token: string, newPassword: string, role: string): Promise<string>;
//   changePassword(userId: string, data: { oldPassword: string; newPassword: string }, role: string): Promise<{ success: boolean; message: string }>;
//   logoutCustomer(refreshToken: string): Promise<void>;
//   logoutCarOwner(refreshToken: string): Promise<void>;
// }


export interface IAuthService {
  registerBasicDetails(data: Partial<ICustomer | ICarOwner>, role: string): Promise<{ customer?: ICustomer; carOwner?: ICarOwner }>;
  verifyOtp(email: string, otp: string, role: string): Promise<{ customer?: ICustomer; carOwner?: ICarOwner }>;
  resendOtp(email: string, role: string): Promise<ICustomer | ICarOwner | null>;
  loginCustomer(email: string, password: string): Promise<{ customerAccessToken: string; refreshToken: string; customer: ICustomer | null }>;
  loginCarOwner(email: string, password: string): Promise<{ ownerAccessToken: string; refreshToken: string; carOwner: ICarOwner | null }>;
  loginAdmin(email: string, password: string): Promise<{ adminAccessToken: string; refreshToken: string; admin: IAdmin | null }>;
  loginCustomerGoogle(fullName: string, email: string, profileImage: string, provider: string, role: string): Promise<{ customerAccessToken: string; refreshToken: string; customer: ICustomer }>;
  loginOwnerGoogle(fullName: string, email: string, profileImage: string, provider: string, role: string): Promise<{ ownerAccessToken: string; refreshToken: string; carOwner: ICarOwner }>;
  renewAuthToken(refreshToken: string, role: string): Promise<{ accessToken: string; refreshToken: string }>;
  completeRegistration(userId: string, data: Partial<ICustomer | ICarOwner>, role: string): Promise<ICustomer | ICarOwner>;
  forgotPassword(email: string, role: string): Promise<void>;
  resetPassword(token: string, newPassword: string, role: string): Promise<string>;
  changePassword(userId: string, data: { oldPassword: string; newPassword: string }, role: string): Promise<{ success: boolean; message: string }>;
  logoutCustomer(refreshToken: string): Promise<void>;
  logoutCarOwner(refreshToken: string): Promise<void>;
  logoutAdmin(refreshToken: string): Promise<void>;
}