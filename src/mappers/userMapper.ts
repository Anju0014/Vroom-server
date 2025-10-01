import { User } from '../../../models/User';

export const userMapper = {
  toDTO(user: User): any {
    return {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      phoneNumber: user.phoneNumber,
      address: user.address,
      isVerified: user.isVerified,
      processStatus: user.processStatus,
      blockStatus: user.blockStatus,
      verifyStatus: user.verifyStatus,
      status: user.status,
      idVerified: user.idVerified,
      idProof: user.idProof,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Exclude sensitive fields like password
    };
  },
};