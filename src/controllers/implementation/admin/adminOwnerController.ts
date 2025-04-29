import {Response,Request} from 'express'
import IAdminOwnerController from '../../interfaces/admin/IAdminOwnerController';
import { IAdminOwnerService} from '../../../services/interfaces/admin/IAdminOwnerServices';
import { StatusCode } from '../../../constants/statusCode';
import { MESSAGES } from '../../../constants/message';

class AdminOwnerController implements IAdminOwnerController{
    private _adminOwnerService: IAdminOwnerService

    constructor(_adminOwnerService: IAdminOwnerService) {
        this._adminOwnerService = _adminOwnerService
    }


async getAllOwnersforVerify(req: Request, res: Response):Promise<void>{
    try {
        console.log("reached.......5")
        console.log("Calling this._adminService.listAllCustomers()...");
        const owners = await this._adminOwnerService.listAllOwnerVerify();
        console.log("Finished calling listAllCustomers()");
        console.log(owners)
        res.status(StatusCode.OK).json({
            success: true,
            message: MESSAGES.SUCCESS.OWNERS_FETCHED || "Car owners fetched successfully",
            data: owners
        });
    } catch (error: any) {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MESSAGES.ERROR.SERVER_ERROR
        });
    }
}


async getAllCarsforVerify(req: Request, res: Response):Promise<void>{
    try {
        console.log("reached.......5")
        console.log("Calling this._adminService.listAllCustomers()...");
        const cars = await this._adminOwnerService.listAllCarsVerify();
        console.log("Finished calling listAllCustomers()");
        console.log(cars)
        res.status(StatusCode.OK).json({
            success: true,
            message: MESSAGES.SUCCESS.CARS_FETCHED || "Cars fetched successfully",
            data: cars
        });
 
    } catch (error: any) {
   
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MESSAGES.ERROR.SERVER_ERROR
        });
    }
}

async getAllBookings(req: Request, res: Response):Promise<void>{
    try {
        console.log("reached.......5")
        console.log("Calling this._adminService.listAllBookings()...");
        const bookings = await this._adminOwnerService.listAllBookings();
        console.log("Finished calling listAllBookings()");
        console.log(bookings)
        res.status(StatusCode.OK).json({
            success: true,
            message: MESSAGES.SUCCESS.CARS_FETCHED || "Bookings fetched successfully",
            data: bookings
        });
 
    } catch (error: any) {
   
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MESSAGES.ERROR.SERVER_ERROR
        });
    }
}




async updateOwnerVerifyStatus(req: Request, res: Response): Promise<void> {
    try{
    const { userId } = req.params;  
    const { status, reason } = req.body;

    console.log("reshhjbdh", status,reason)
    if (!userId || status === undefined) {
      res.status(400).json({ message: "Missing required fields" });
      return 
    }

    const verifyDetails = status === -1 ? { verifyStatus:status, rejectionReason: reason } : { verifyStatus:status };
    let updatedUser= await this._adminOwnerService.updateOwnerVerifyStatus(userId,verifyDetails);
    res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || "Owner status updated successfully",
        user: updatedUser
    });

    }
    catch(error){
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MESSAGES.ERROR.SERVER_ERROR
        });

    }
}

  async updateOwnerBlockStatus(req: Request, res: Response): Promise<void> {
    console.log("hihihi")
    const { userId } = req.params;  
        const { status } = req.body;  
    console.log(userId, status)
        if (!userId || status === undefined) {
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: MESSAGES.ERROR.MISSING_FIELDS
            });
            return;
        }
    console.log(userId)
    console.log("hujuhuju,,,,....")
    try {
      const updatedUser = await this._adminOwnerService.updateOwnerBlockStatus(userId, status);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || "Owner status updated successfully",
        user: updatedUser
    });
    } catch (error:any) {
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.SERVER_ERROR
    });
    }
  }

  async updateCarVerifyStatus(req: Request, res: Response): Promise<void> {
    try{
        console.log("&hsild")
    const { carId } = req.params;  
    const { status, reason } = req.body;

    console.log("reshhjbdh", status,reason)
    if (!carId || status === undefined) {
      res.status(400).json({ message: "Missing required fields" });
      return 
    }

    const verifyDetails = status === -1 ? { verifyStatus:status, rejectionReason: reason } : { verifyStatus:status };
    let updatedCar= await this._adminOwnerService.updateCarVerifyStatus(carId,verifyDetails);
    res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || "Car status updated successfully",
        car: updatedCar
    });

    }
    catch(error){
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MESSAGES.ERROR.SERVER_ERROR
        });

    }
}


}
export default AdminOwnerController

