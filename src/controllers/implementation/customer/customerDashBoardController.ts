import { Response,Request} from 'express';
import { CustomRequest } from "../../../middlewares/authMiddleWare";
import { MESSAGES } from "../../../constants/message";
import { StatusCode } from "../../../constants/statusCode";

import ICustomerDashBoardController from '../../interfaces/customer/ICustomerDashBoardController';
import {ICustomerDashBoardService} from '../../../services/interfaces/customer/ICustomerDashBoardServices'

class CustomerDashBoardController implements ICustomerDashBoardController{

    private _customerDashService: ICustomerDashBoardService

    constructor(_customerDashService: ICustomerDashBoardService) {
        this._customerDashService = _customerDashService
    }


    async getCustomerBookingDetails (req: CustomRequest, res: Response):Promise<void>{
        try {
          const userId = req.userId
          if(!userId){
            res.status(404).json({message:'User Id not found'})
            return
          }
           const page = parseInt(req.query.page as string) || 1;
          const limit = parseInt(req.query.limit as string) || 9;
          if (page < 1 || limit < 1 || limit > 100) {
              res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: MESSAGES.ERROR.INVALID_PAGE_OR_LIMIT,
            });
            return;
          }
          const bookings = await this._customerDashService.getCustomerBookings(userId,page,limit);
          const total = await this._customerDashService.getCustomerBookingCount(userId);
          res.status(200).json({bookings,total});
          return
        } catch (error) {
          console.error("Failed to fetch bookings:", error);
          res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR });
          return
        }
    };
      

      async cancelBooking(req: Request, res: Response): Promise<void> {
        console.log("**************booking cancel controller*******************************")
        const { bookingId } = req.params;
        try {
         let booking= await this._customerDashService.cancelBooking(bookingId);
         console.log(booking)
          res.status(StatusCode.OK).json({ success: true });
        } catch (err) {
          res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR });
       
        }
      }
}
   

export default CustomerDashBoardController