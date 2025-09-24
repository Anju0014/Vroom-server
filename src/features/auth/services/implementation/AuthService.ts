import { IAuthRepository, ICustomer, ICarOwner } from '../../repositories/interfaces/IAuthRepository';
import  generateAccessToken from '../../../../utils/jwtUtils';
import generateRefreshToken  from '../../../../utils/jwtUtils';
import { IAuthService } from '../interfaces/IAuthService';
import { IAdmin } from '../../../../models/admin/adminModel';

class AuthService implements IAuthService {
  constructor(private authRepository: IAuthRepository) {}

  async registerBasicDetails(data: Partial<ICustomer | ICarOwner>, role: string): Promise<{ customer?: ICustomer; carOwner?: ICarOwner }> {
    const user = await this.authRepository.registerBasicDetails(data, role);
    return role === 'customer' ? { customer: user as ICustomer } : { carOwner: user as ICarOwner };
  }

  async verifyOtp(email: string, otp: string, role: string): Promise<{ customer?: ICustomer; carOwner?: ICarOwner }> {
    const user = await this.authRepository.verifyOtp(email, otp, role);
    return role === 'customer' ? { customer: user as ICustomer } : { carOwner: user as ICarOwner };
  }

  async resendOtp(email: string, role: string): Promise<ICustomer | ICarOwner | null> {
    return this.authRepository.resendOtp(email, role);
  }

  async loginCustomer(email: string, password: string): Promise<{ customerAccessToken: string; refreshToken: string; customer: ICustomer | null }> {
    const customer = await this.authRepository.findByEmail(email, 'customer');
    if (!customer || !customer.isVerified) return { customerAccessToken: '', refreshToken: '', customer: null };
    const customerAccessToken = generateAccessToken({ id: customer._id, role: 'customer' });
    const refreshToken = generateRefreshToken({ id: customer._id, role: 'customer' });
    await this.authRepository.logout(refreshToken, 'customer');
    return { customerAccessToken, refreshToken, customer: customer as ICustomer };
  }

  async loginCarOwner(email: string, password: string): Promise<{ ownerAccessToken: string; refreshToken: string; carOwner: ICarOwner | null }> {
    const carOwner = await this.authRepository.findByEmail(email, 'carOwner');
    if (!carOwner || !carOwner.isVerified) return { ownerAccessToken: '', refreshToken: '', carOwner: null };
    const ownerAccessToken = generateAccessToken({ id: carOwner._id, role: 'carOwner' });
    const refreshToken = generateRefreshToken({ id: carOwner._id, role: 'carOwner' });
    await this.authRepository.logout(refreshToken, 'carOwner');
    return { ownerAccessToken, refreshToken, carOwner: carOwner as ICarOwner };
  }

  async loginCustomerGoogle(fullName: string, email: string, profileImage: string, provider: string, role: string): Promise<{ customerAccessToken: string; refreshToken: string; customer: ICustomer }> {
    const customer = await this.authRepository.loginGoogle(fullName, email, profileImage, provider, role);
    const customerAccessToken = generateAccessToken({ id: customer._id, role: 'customer' });
    const refreshToken = generateRefreshToken({ id: customer._id, role: 'customer' });
    return { customerAccessToken, refreshToken, customer: customer as ICustomer };
  }

  async loginOwnerGoogle(fullName: string, email: string, profileImage: string, provider: string, role: string): Promise<{ ownerAccessToken: string; refreshToken: string; carOwner: ICarOwner }> {
    const carOwner = await this.authRepository.loginGoogle(fullName, email, profileImage, provider, role);
    const ownerAccessToken = generateAccessToken({ id: carOwner._id, role: 'carOwner' });
    const refreshToken = generateRefreshToken({ id: carOwner._id, role: 'carOwner' });
    return { ownerAccessToken, refreshToken, carOwner: carOwner as ICarOwner };
  }

  async loginAdmin(email: string, password: string): Promise<{ adminAccessToken: string; refreshToken: string; admin: IAdmin | null }> {
  const admin = await this.authRepository.findByEmail(email, 'admin');
  if (!admin || !admin.isVerified) return { adminAccessToken: '', refreshToken: '', admin: null };
  const adminAccessToken = generateAccessToken({ id: admin._id, role: 'admin' });
  const refreshToken = generateRefreshToken({ id: admin._id, role: 'admin' });
  await this.authRepository.logout(refreshToken, 'admin');
  return { adminAccessToken, refreshToken, admin: admin as IAdmin };
}

async logoutAdmin(refreshToken: string): Promise<void> {
  await this.authRepository.logout(refreshToken, 'admin');
}
  async renewAuthToken(refreshToken: string, role: string): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authRepository.renewAuthToken(refreshToken, role);
  }

  async completeRegistration(userId: string, data: Partial<ICustomer | ICarOwner>, role: string): Promise<ICustomer | ICarOwner> {
    return this.authRepository.completeRegistration(userId, data, role);
  }

  async forgotPassword(email: string, role: string): Promise<void> {
    await this.authRepository.forgotPassword(email, role);
  }

  async resetPassword(token: string, newPassword: string, role: string): Promise<string> {
    return this.authRepository.resetPassword(token, newPassword, role);
  }

  async changePassword(userId: string, data: { oldPassword: string; newPassword: string }, role: string): Promise<{ success: boolean; message: string }> {
    return this.authRepository.changePassword(userId, data.oldPassword, data.newPassword, role);
  }

  async logoutCustomer(refreshToken: string): Promise<void> {
    await this.authRepository.logout(refreshToken, 'customer');
  }

  async logoutCarOwner(refreshToken: string): Promise<void> {
    await this.authRepository.logout(refreshToken, 'carOwner');
  }
}
export default AuthService;