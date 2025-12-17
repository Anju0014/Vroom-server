export interface CustomerDTO {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  isVerified: boolean;
  processStatus: number;
  verifyStatus: number;
  blockStatus: number;
  idVerified: boolean;
  profileImage?: string;
  createdAt?: Date;
}
