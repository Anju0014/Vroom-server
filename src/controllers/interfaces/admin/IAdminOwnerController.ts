import {Request,Response} from "express"
interface IAdminOwnerController{
    getAllOwnersforVerify(req: Request, res: Response):Promise<void>
    getAllCarsforVerify(req: Request, res: Response):Promise<void>
    updateOwnerVerifyStatus(req: Request, res: Response): Promise<void>
    updateOwnerBlockStatus(req: Request, res: Response): Promise<void>
    updateCarVerifyStatus(req: Request, res: Response): Promise<void>
    getAllBookings(req: Request, res: Response):Promise<void>
     updateCarBlockStatus(req: Request, res: Response): Promise<void>

   
}

export default IAdminOwnerController