import { Response, Request } from 'express';
import IAdminController from '../../interfaces/admin/IAdminController';
import { IAdminService } from '../../../services/interfaces/admin/IAdminServices';
import { StatusCode } from '../../../constants/statusCode';
import { MESSAGES } from '../../../constants/message';
import { getCookieOptions } from '../../../utils/cookieOptions';
import { AdminMapper } from '../../../mappers/admin.mapper';
import { CustomerMapper } from '../../../mappers/customer.mapper';
import { CarOwnerMapper } from '../../../mappers/carOwner.mapper';

import { AdminLoginRequestDTO } from '../../../dtos/admin/adminLogin.request.dto';
import { UpdateCustomerBlockStatusRequestDTO } from '../../../dtos/customer/customerStatusUpdate.request.dto';

class AdminController implements IAdminController {
  private _adminService: IAdminService;

  constructor(_adminService: IAdminService) {
    this._adminService = _adminService;
  }

  async loginAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: AdminLoginRequestDTO = req.body;
      if (!email || !password) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }

      // const { adminAccessToken, refreshToken, admin } = await this._adminService.loginAdmin(
      //   email,
      //   password
      // );
       const responseDTO =
      await this._adminService.loginAdmin(email, password);

      // if (!admin) {
      //   res.status(StatusCode.NOT_FOUND).json({
      //     success: false,
      //     message: MESSAGES.ERROR.ADMIN_NOT_FOUND,
      //   });
      //   return;
      // }

      res.cookie('adminRefreshToken', responseDTO.refreshToken, getCookieOptions(true));
      res.cookie('adminAccessToken', responseDTO.adminAccessToken, getCookieOptions(false));

    //    const responseDTO = AdminMapper.toLoginResponse(
    //   admin,
    //   adminAccessToken,
    //   refreshToken
    // );

    res.status(StatusCode.OK).json({
      success: true,
      message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
      data: responseDTO,
    });
      // if (!admin) {
      //   res.status(400).json({ error: 'admin not found' });
      //   return;
      // }
      // res.status(StatusCode.OK).json({
      //   success: true,
      //   message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
      //   adminAccessToken,
      //   user: {
      //     id: admin._id,
      //     email: admin.email,
      //     role: 'admin',
      //   },
      // });
    } catch (error:any) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
      // console.log('LoginError from Admin:', error);
      // res.status(StatusCode.NOT_FOUND).json({ error: error instanceof Error ? error.message : 'Login failed' });
    }
  }

  async logoutAdmin(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.adminRefreshToken;
      if (!refreshToken) {
        console.log('No refresh token found');
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.NO_REFRESH_TOKEN,
        });
        return;
      }
      await this._adminService.logoutAdmin(refreshToken);

      // res.clearCookie("adminRefreshToken", {
      //       ...getCookieOptions(true),
      // });
      res.clearCookie('adminRefreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGOUT_SUCCESS,
      });
    } catch (error) {
      // res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      //   success: false,
      //   message: MESSAGES.ERROR.SERVER_ERROR,
      // });
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
   const { customers, total } =
  await this._adminService.listAllCustomers(page, limit, search);

res.status(StatusCode.OK).json({
  success: true,
  message: MESSAGES.SUCCESS.CUSTOMERS_FETCHED,
  data: customers,
  total,
});
    } catch (error: any) {
      // res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      //   success: false,
      //   message: MESSAGES.ERROR.SERVER_ERROR,
      // });
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllOwners(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const { carOwners, total } = await this._adminService.listAllCarOwners(page, limit, search);
      // const ownerDTOs = carOwners.map(CarOwnerMapper.toListDTO);

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.OWNERS_FETCHED || 'Car owners fetched successfully',
        data: carOwners,
        total,
      });
    } catch (error: any) {
  
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
      // res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      //   success: false,
      //   message: MESSAGES.ERROR.SERVER_ERROR,
      // });
    }
  }

  async updateCustomerBlockStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { status }: UpdateCustomerBlockStatusRequestDTO  = req.body;
      console.log(userId, status);
      if (!userId || status === undefined) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }

      const updatedCustomer = await this._adminService.updateCustomerBlockStatus(userId, status);

     if(!updatedCustomer) {
      res.status(StatusCode.NOT_FOUND).json({
        success: false,
        message: MESSAGES.ERROR.CUSTOMER_NOT_FOUND,
      });
      return;
    }


      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || 'Customer status updated successfully',
        data: updatedCustomer,
      });
    } catch (error:any) {
       this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
      // res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      //   success: false,
      //   message: MESSAGES.ERROR.SERVER_ERROR,
      // });
    }
  }



   private handleError(
    res: Response,
    error: unknown,
    statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR
  ): void {
    console.error('Error:', error);

    const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
}
export default AdminController;
