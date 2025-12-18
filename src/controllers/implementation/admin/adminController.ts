import { Response, Request } from 'express';
import IAdminController from '../../interfaces/admin/IAdminController';
import { IAdminService } from '../../../services/interfaces/admin/IAdminServices';
import { StatusCode } from '../../../constants/statusCode';
import { MESSAGES } from '../../../constants/message';
import { getCookieOptions } from '../../../utils/cookieOptions';

import { AdminLoginRequestDTO } from '../../../dtos/admin/adminLogin.request.dto';
import { UpdateCustomerBlockStatusRequestDTO } from '../../../dtos/customer/customerStatusUpdate.request.dto';
import logger from '../../../utils/logger';

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

      const responseDTO = await this._adminService.loginAdmin(email, password);

      res.cookie('adminRefreshToken', responseDTO.refreshToken, getCookieOptions(true));
      res.cookie('adminAccessToken', responseDTO.adminAccessToken, getCookieOptions(false));


      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
        data: responseDTO,
      });
    } catch (error: any) {
      logger.error('LoginError from Admin:', error);
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async logoutAdmin(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.adminRefreshToken;
      if (!refreshToken) {
        logger.info('No refresh token found');
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.NO_REFRESH_TOKEN,
        });
        return;
      }
      await this._adminService.logoutAdmin(refreshToken);

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
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const { customers, total } = await this._adminService.listAllCustomers(page, limit, search);

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.CUSTOMERS_FETCHED,
        data: customers,
        total,
      });
    } catch (error: any) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllOwners(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const { carOwners, total } = await this._adminService.listAllCarOwners(page, limit, search);

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.OWNERS_FETCHED || 'Car owners fetched successfully',
        data: carOwners,
        total,
      });
    } catch (error: any) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  async updateCustomerBlockStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { status }: UpdateCustomerBlockStatusRequestDTO = req.body;
      if (!userId || status === undefined) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }

      const updatedCustomer = await this._adminService.updateCustomerBlockStatus(userId, status);

      if (!updatedCustomer) {
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
    } catch (error: any) {
      this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  private handleError(
    res: Response,
    error: unknown,
    statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR
  ): void {
    logger.error('Error:', error);

    const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
}
export default AdminController;
