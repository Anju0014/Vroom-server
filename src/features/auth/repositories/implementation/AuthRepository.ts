import { BaseRepository } from '../../../core/repositories/BaseRepository';
import { IAuthRepository, ICustomer, ICarOwner, IAdmin } from './IAuthRepository';
import { Customer } from "../../../../models/customer/customerModel";
import { CarOwner } from "../../../../models/carowner/carOwnerModel";
import { Admin } from "../../../../models/admin/adminModel";
import generateAccessToken, generateRefreshToken from '../../../../utils/jwtUtils'
import comparePassword, hashPassword  from '../../../../utils/passwordUtils';
import mongoose, { Model } from 'mongoose';

interface RefreshToken {
  _id: string;
  refreshToken: string;
  userId: string;
  role: string;
}

const RefreshTokenSchema = new mongoose.Schema<RefreshToken>({
  refreshToken: { type: String, required: true },
  userId: { type: String, required: true },
  role: { type: String, required: true },
});

const RefreshToken = mongoose.model<RefreshToken>('RefreshToken', RefreshTokenSchema);

class AuthRepository extends BaseRepository implements IAuthRepository {
  private getModel(role: string): Model<ICustomer | ICarOwner | IAdmin> {
    return role === 'customer' ? Customer : role === 'carOwner' ? CarOwner : Admin;
  }

  async registerBasicDetails(data: Partial<ICustomer | ICarOwner>, role: string): Promise<ICustomer | ICarOwner> {
    if (role === 'admin') throw new Error('Admins cannot register');
    const Model = this.getModel(role);
    const user = new Model({
      ...data,
      role,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return user.save();
  }

  async findByEmail(email: string, role: string): Promise<ICustomer | ICarOwner | IAdmin | null> {
    const Model = this.getModel(role);
    return Model.findOne({ email });
  }

  async verifyOtp(email: string, otp: string, role: string): Promise<ICustomer | ICarOwner | null> {
    if (role === 'admin') throw new Error('Admins do not use OTP');
    const Model = this.getModel(role);
    const user = await Model.findOne({ email, otp });
    if (user) {
      await Model.updateOne({ email }, { $set: { isVerified: true, otp: null } });
      return Model.findOne({ email });
    }
    return null;
  }

  async resendOtp(email: string, role: string): Promise<ICustomer | ICarOwner | null> {
    if (role === 'admin') throw new Error('Admins do not use OTP');
    const Model = this.getModel(role);
    const user = await Model.findOne({ email });
    if (user) {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      await Model.updateOne({ email }, { $set: { otp: newOtp } });
      return Model.findOne({ email });
    }
    return null;
  }

  async completeRegistration(userId: string, data: Partial<ICustomer | ICarOwner>, role: string): Promise<ICustomer | ICarOwner> {
    if (role === 'admin') throw new Error('Admins cannot complete registration');
    const Model = this.getModel(role);
    await Model.updateOne({ _id: userId }, { $set: { ...data, updatedAt: new Date() } });
    const updatedUser = await Model.findById(userId);
    if (!updatedUser) throw new Error('User not found');
    return updatedUser;
  }

  async forgotPassword(email: string, role: string): Promise<void> {
    if (role === 'admin') throw new Error('Admins cannot reset password this way');
    const Model = this.getModel(role);
    const user = await Model.findOne({ email });
    if (user) {
      const resetToken = Math.random().toString(36).substring(2);
      await Model.updateOne({ email }, { $set: { resetToken } });
      // TODO: Implement email service to send resetToken
    }
  }

  async resetPassword(token: string, newPassword: string, role: string): Promise<string> {
    if (role === 'admin') throw new Error('Admins cannot reset password this way');
    const Model = this.getModel(role);
    const user = await Model.findOne({ resetToken: token });
    if (!user) return 'Invalid or expired token';
    await Model.updateOne(
      { resetToken: token },
      { $set: { password: await hashPassword(newPassword), resetToken: null } }
    );
    return 'Password reset successfully';
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string, role: string): Promise<{ success: boolean; message: string }> {
    const Model = this.getModel(role);
    const user = await Model.findById(userId);
    if (!user || !(await comparePassword(oldPassword, user.password))) {
      return { success: false, message: 'Invalid current password' };
    }
    await Model.updateOne({ _id: userId }, { $set: { password: await hashPassword(newPassword) } });
    return { success: true, message: 'Password changed successfully' };
  }

  async logout(refreshToken: string, role: string): Promise<void> {
    await RefreshToken.deleteOne({ refreshToken, role });
  }

  async loginGoogle(fullName: string, email: string, profileImage: string, provider: string, role: string): Promise<ICustomer | ICarOwner> {
    if (role === 'admin') throw new Error('Admins cannot use Google login');
    const Model = this.getModel(role);
    let user = await Model.findOne({ email, provider });
    if (!user) {
      user = new Model({
        fullName,
        email,
        profileImage,
        provider,
        role,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await user.save();
    }
    return user;
  }

  async renewAuthToken(refreshToken: string, role: string): Promise<{ accessToken: string; refreshToken: string }> {
    const token = await RefreshToken.findOne({ refreshToken, role });
    if (!token) throw new Error('Invalid refresh token');
    const Model = this.getModel(role);
    const user = await Model.findById(token.userId);
    if (!user) throw new Error('User not found');
    const accessToken = generateAccessToken({ id: user._id, role });
    const newRefreshToken = generateRefreshToken({ id: user._id, role });
    await RefreshToken.updateOne(
      { refreshToken },
      { $set: { refreshToken: newRefreshToken } }
    );
    return { accessToken, refreshToken: newRefreshToken };
  }
}

export default AuthRepository;


