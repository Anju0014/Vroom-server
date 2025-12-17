export interface CarOwnerProfileDTO {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  address?: {
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  processStatus: number;
  verifyStatus: number;
}

export interface UpdateCarOwnerProfileRequestDTO {
  phoneNumber?: string;
  profileImage?: string;
  address?: {
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}
