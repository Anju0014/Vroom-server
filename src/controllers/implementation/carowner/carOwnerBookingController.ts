import { Response,Request} from 'express';
import {Car, ICar} from '../../../models/car/carModel'
import { CustomRequest } from "../../../middlewares/authMiddleWare";
import { MESSAGES } from "../../../constants/message";
import { StatusCode } from "../../../constants/statusCode";
import ICarOwnerBookingController from '../../interfaces/carowner/ICarOwnerBookingController';
// import ICarOwnerCarsController from '../../interfaces/carowner/ICarOwnerCarsController';
// import { ICarOwnerCarsService} from '../../../services/interfaces/carOwner/ICarOwnerCarsServices';
import { ICarOwnerBookingService } from '../../../services/interfaces/carOwner/ICarOwnerBookingServices';


class CarOwnerBookingController implements ICarOwnerBookingController{
    private _ownerBookingService: ICarOwnerBookingService

    constructor(_ownerBookingService: ICarOwnerBookingService) {
        this._ownerBookingService = _ownerBookingService
    }



async getCarOwnerBookings(req: CustomRequest, res: Response) {
    try {
      const carOwnerId = req.userId; 
  
      if(!carOwnerId){
        res.status(StatusCode.NOT_FOUND).json({success:false,message:MESSAGES.ERROR.NO_OWNER_ID_FOUND})
        return
      }
      const bookings = await this._ownerBookingService.getBookingsForCarOwner(carOwnerId);
  
      res.status(StatusCode.OK).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      console.error('Failed to fetch car owner bookings:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Something went wrong' });
    }
  }
}

export default CarOwnerBookingController