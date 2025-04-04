import {Request,Response} from "express"
interface IAdminController{
  
    loginAdmin(req:Request,res:Response):Promise<void>;
   
    logoutAdmin(req:Request,res:Response): Promise<void>;
    getAllCustomers(req: Request, res: Response):Promise<void>;
    getAllOwners(req: Request, res: Response):Promise<void>;
    // updateCustomerStatus(req: Request, res: Response): Promise<void>
    // verifyCustomer(req: Request, res: Response): Promise<void>
    // updateOwnerStatus(req: Request, res: Response): Promise<void>
    // verifyOwner(req: Request, res: Response): Promise<void>
    updateCustomerStatus(req: Request, res: Response): Promise<void>
    updateOwnerStatus(req: Request, res: Response): Promise<void>
}

export default IAdminController