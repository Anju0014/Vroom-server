import { Request, Response } from 'express';
import { IAdminUserService } from '../../services/interfaces/users/admin/IAdminUserService';
import { StatusCode } from '../../constants/statusCode';
import { MESSAGES } from '../../constants/message';
import { userMapper } from '../../mappers/userMapper';

export class AdminUserController {
  constructor(private adminUserService: IAdminUserService) {}

  async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const { users: customers, total } = await this.adminUserService.listAllUsers('customer', page, limit, search);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.CUSTOMERS_FETCHED || 'Customers fetched successfully',
        data: customers.map(userMapper.toDTO),
        total,
      });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
      });
    }
  }

  async getAllCarOwners(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const { users: carOwners, total } = await this.adminUserService.listAllUsers('carOwner', page, limit, search);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.OWNERS_FETCHED || 'Car owners fetched successfully',
        data: carOwners.map(userMapper.toDTO),
        total,
      });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
      });
    }
  }

  async getAllOwnersForVerify(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const { users: carOwners, total } = await this.adminUserService.listAllUsersForVerify('carOwner', page, limit, search);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.OWNERS_FETCHED || 'Car owners for verification fetched successfully',
        data: carOwners.map(userMapper.toDTO),
        total,
      });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
      });
    }
  }

  async updateCustomerBlockStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { status } = req.body;
      if (!userId || status === undefined) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      const updatedUser = await this.adminUserService.updateUserBlockStatus(userId, 'customer', status);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || 'Customer status updated successfully',
        user: userMapper.toDTO(updatedUser),
      });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
      });
    }
  }

  async updateOwnerBlockStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { status } = req.body;
      if (!userId || status === undefined) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      const updatedUser = await this.adminUserService.updateUserBlockStatus(userId, 'carOwner', status);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || 'Car owner status updated successfully',
        user: userMapper.toDTO(updatedUser),
      });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
      });
    }
  }

  async updateOwnerVerifyStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { status, reason } = req.body;
      if (!userId || status === undefined) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      const verifyDetails = status === -1 ? { verifyStatus: status, rejectionReason: reason } : { verifyStatus: status };
      const updatedUser = await this.adminUserService.updateOwnerVerifyStatus(userId, verifyDetails);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || 'Car owner verification status updated successfully',
        user: userMapper.toDTO(updatedUser),
      });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
      });
    }
  }
}

export default AdminUserController;