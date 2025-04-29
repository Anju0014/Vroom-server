
import {Request, Response} from "express"

interface CustomerDashBoardController{
getCustomerBookingDetails (req:Request, res: Response):Promise<void>
}
export default CustomerDashBoardController