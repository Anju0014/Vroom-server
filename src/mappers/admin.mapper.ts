// import { IAdmin } from '../models/admin/adminModel';
// import { AdminLoginResponseDTO } from '../dtos/admin/adminLogin.response.dto';

// export class AdminMapper {
//   static toLoginResponse(
//     admin: IAdmin,
//     accessToken: string,
//     refreshToken: string
//   ): AdminLoginResponseDTO {
//     return {
//       admin: {
//         id: admin._id.toString(),
//         email: admin.email,
//         role: 'admin',
//       },
//       accessToken,
//       refreshToken,
//     };
//   }
// }

import { IAdmin } from '../models/admin/adminModel';
import { AdminLoginResponseDTO } from '../dtos/admin/adminLogin.response.dto';

export class AdminMapper {
  static toLoginResponse(
    admin: IAdmin,
    accessToken: string,
    refreshToken: string
  ): AdminLoginResponseDTO {
    return {
      adminAccessToken: accessToken,
      refreshToken,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        role: 'admin',
      },
    };
  }
}
