import { Response, Request } from 'express';
import IAdminOwnerController from '../../interfaces/admin/IAdminOwnerController';
import { IAdminOwnerService } from '../../../services/interfaces/admin/IAdminOwnerServices';
import { StatusCode } from '../../../constants/statusCode';
import { MESSAGES } from '../../../constants/message';

class AdminOwnerController implements IAdminOwnerController {
  private _adminOwnerService: IAdminOwnerService;

  constructor(_adminOwnerService: IAdminOwnerService) {
    this._adminOwnerService = _adminOwnerService;
  }

  async getAllOwnersforVerify(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const { carOwners, total } = await this._adminOwnerService.listAllOwnerforVerify(
        page,
        limit,
        search
      );

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.OWNERS_FETCHED || 'Car owners fetched successfully',
        data: carOwners,
        total,
      });
    } catch (error: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
      });
    }
  }

  async getAllCarsforVerify(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const { cars, total } = await this._adminOwnerService.listAllCarsforVerify(
        page,
        limit,
        search
      );

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.CARS_FETCHED || 'Cars fetched successfully',
        data: cars,
        total,
      });
    } catch (error: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
      });
    }
  }

  async getAllVerifiedCars(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const { cars, total } = await this._adminOwnerService.listAllVerifiedCars(
        page,
        limit,
        search
      );

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.CARS_FETCHED || 'Cars fetched successfully',
        data: cars,
        total,
      });
    } catch (error: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
      });
    }
  }
  async getAllBookings(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';

      const { bookings, total } = await this._adminOwnerService.listAllBookings(
        page,
        limit,
        search
      );
      console.log('Finished calling listAllBookings()');
      console.log(bookings);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.BOOKINGS_FETCHED || 'Bookings fetched successfully',
        data: bookings,
        total,
      });
    } catch (error: any) {
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
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      const verifyDetails =
        status === -1
          ? { verifyStatus: status, rejectionReason: reason }
          : { verifyStatus: status };
      let updatedUser = await this._adminOwnerService.updateOwnerVerifyStatus(
        userId,
        verifyDetails
      );
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || 'Owner status updated successfully',
        user: updatedUser,
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

      const updatedUser = await this._adminOwnerService.updateOwnerBlockStatus(userId, status);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || 'Owner status updated successfully',
        user: updatedUser,
      });
    } catch (error: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
      });
    }
  }

  async updateCarBlockStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log('show the details of block');
      const { carId } = req.params;
      const { status } = req.body;
      if (!carId || status === undefined) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }

      const updatedCar = await this._adminOwnerService.updateCarBlockStatus(carId, status);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || 'Car status updated successfully',
        car: updatedCar,
      });
    } catch (error: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
      });
    }
  }

  async updateCarVerifyStatus(req: Request, res: Response): Promise<void> {
    try {
      const { carId } = req.params;
      const { status, reason } = req.body;

      if (!carId || status === undefined) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      const verifyDetails =
        status === -1
          ? { verifyStatus: status, rejectionReason: reason }
          : { verifyStatus: status };
      let updatedCar = await this._adminOwnerService.updateCarVerifyStatus(carId, verifyDetails);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || 'Car status updated successfully',
        car: updatedCar,
      });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR,
      });
    }
  }
}
export default AdminOwnerController;
