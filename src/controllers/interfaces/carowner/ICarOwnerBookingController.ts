import { Response } from 'express';
import { CustomRequest } from '../../../middlewares/authMiddleWare';

interface ICarOwnerBookingController {
  getCarOwnerBookings(req: CustomRequest, res: Response): Promise<void>;
}

export default ICarOwnerBookingController;
