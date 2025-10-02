import mongoose from 'mongoose';


export interface UserDTO {
  id: string;
  fullName?: string;
  email: string;
  role?: 'carOwner' | 'admin' | 'customer'; 
  profileImage?: string; 
  phoneNumber?: string; 
  address?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }; 
  isVerified?: boolean; 
  processStatus?: number; 
  blockStatus?: number; 
  verifyStatus?: number; 
  status?: number; 
  idVerified?: boolean; 
  idProof?: string; 
  createdAt?: string; 
  updatedAt?: string; 
}

export const userMapper = {
  toDTO(user: any & { _id: mongoose.Types.ObjectId }): UserDTO {
  
    const validRole = ['carOwner', 'admin', 'customer'].includes(user.role)
      ? user.role as 'carOwner' | 'admin' | 'customer'
      : user.password ? 'admin' : undefined; 

    return {
      id: user._id.toString(),
      fullName: user.fullName ? String(user.fullName) : undefined,
      email: String(user.email), 
      role: validRole,
      profileImage: user.profileImage ? String(user.profileImage) : undefined,
      phoneNumber: user.phoneNumber ? String(user.phoneNumber) : undefined,
      address: user.address,
      isVerified: user.isVerified,
      processStatus: user.processStatus,
      blockStatus: user.blockStatus,
      verifyStatus: user.verifyStatus,
      status: user.status,
      idVerified: user.idVerified,
      idProof: user.idProof ? String(user.idProof) : undefined,
      createdAt: user.createdAt ? user.createdAt.toISOString() : undefined,
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : undefined,
    };
  },
};