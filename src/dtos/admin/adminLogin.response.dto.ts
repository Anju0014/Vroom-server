// import { AdminDTO } from './admin.dto';

// export interface AdminLoginResponseDTO {
//   admin: AdminDTO;
//   accessToken: string;
//   refreshToken: string;
// }

export interface AdminLoginResponseDTO {
  adminAccessToken: string;
  refreshToken: string;
  admin: {
    id: string;
    email: string;
    role: 'admin';
  };
}
