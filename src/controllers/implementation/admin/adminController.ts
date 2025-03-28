import {Response,Request} from 'express'

import { IAdmin } from '../../../models/admin/adminModel';
import IAdminController from '../../interfaces/admin/IAdminController';
import { IAdminService} from '../../../services/interfaces/admin/IAdminServices';
import { ICustomer } from '../../../models/customer/customerModel';
import { ICarOwner } from '../../../models/carowner/carOwnerModel';


class AdminController implements IAdminController{
    private _adminService: IAdminService

    constructor(_adminService: IAdminService) {
        this._adminService = _adminService
    }


    async loginAdmin(req:Request,res:Response):Promise<void>{
    try{
        console.log("reeached login1 of Admin")
        const {email,password}=req.body;
        if(!email||!password){
            res.status(400).json({error:"Email and Password are required"})
        }

        const {accessToken,refreshToken,admin}= await this._adminService.loginAdmin(email,password)

        res.cookie("adminRefreshToken",refreshToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        })
        if(!admin){
            res.status(400).json({error:"admin not found"})
            return
        }
        res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            user: {
              id:admin._id,
              email: admin.email,
              role: 'admin'  // Optional if roles exist
            }
        })
       

    }catch(error){
        console.log("LoginError from Admin:" ,error)

        res.status(400).json({ error: error instanceof Error ? error.message : "Login failed" })
    }
}

// async logoutAdmin(req: Request, res: Response): Promise<void> {
//     try{
//         const adminId=req.body.adminId;
//         if(!adminId){
//             res.status(400).json({error:"AdminID is required"});
//             return;
//         }
//         await this._adminService.logoutAdmin(adminId);
//         res.clearCookie("adminRefreshToken");
//         res.status(200).json({message:"Looged out successfully"})
//     }catch(error){
//         res.status(500).json({error:"Failed to logout admin"});
//     }
// }


async logoutAdmin(req:Request,res:Response): Promise<void>{
    try{
        const refreshToken=req.cookies.adminRefreshToken
        if(!refreshToken){
            res.status(400).json({error:"No refresh Token"})
        }
        await this._adminService.logoutAdmin(refreshToken)
        res.clearCookie("adminRefreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });
          res.status(200).json({ success: true, message: "Logout successful" });
    }catch (error) {
            res.status(500).json({ error: "Logout failed" });
        }
}




}
export default AdminController

