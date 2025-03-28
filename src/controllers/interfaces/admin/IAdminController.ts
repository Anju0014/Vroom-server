import {Request,Response} from "express"
interface IAdminController{
  
    loginAdmin(req:Request,res:Response):Promise<void>;
   
    logoutAdmin(req:Request,res:Response): Promise<void>;
    
    
}

export default IAdminController