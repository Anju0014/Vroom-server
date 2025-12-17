export interface RegisterCarOwnerRequestDTO {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface RegisterCarOwnerResponseDTO {
  id: string;
  email: string;
  processStatus: number;
}

export interface OtpVerifyRequestDTO {
  email: string;
  otp: string;
}

export interface CarOwnerLoginResponseDTO {
  owner: {
    id: string;
    email: string;
    fullName: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface AuthTokenResponseDTO {
  accessToken: string;
  refreshToken: string;
}

export interface GenericMessageResponseDTO {
  message: string;
}
