import {Request,Response} from "express"

interface ICustomerCarAndBookingController{
    getNearbyCars (req: Request, res: Response): Promise<void>
    getCarDetail (req:Request, res:Response): Promise<void>
    getbookedDatesCars (req: Request, res: Response): Promise<void>
}

export default ICustomerCarAndBookingController