import {Response,Request} from 'express'

import { IAdmin } from '../../../models/admin/adminModel';
import IAdminController from '../../interfaces/admin/IAdminController';
import { IAdminService} from '../../../services/interfaces/admin/IAdminServices';
import { ICustomer } from '../../../models/customer/customerModel';
import { ICarOwner } from '../../../models/carowner/carOwnerModel';
import { StatusCode } from '../../../constants/statusCode';
import { MESSAGES } from '../../../constants/message';
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
        console.log("here?")
        const refreshToken=req.cookies.adminRefreshToken
        if(!refreshToken){
            console.log("error")
            res.status(400).json({error:"No refresh Token"})
            return
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


async getAllCustomers(req: Request, res: Response):Promise<void>{
    try {
        console.log("reached.......5")
        console.log("Calling this._adminService.listAllCustomers()...");
        const customers = await this._adminService.listAllCustomers();
        console.log("Finished calling listAllCustomers()");
        console.log(customers)
        res.status(200).json({ success: true, data: customers });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}


async getAllOwners(req: Request, res: Response):Promise<void>{
    try {
        console.log("reached.......5")
        console.log("Calling this._adminService.listAllCustomers()...");
        const owners = await this._adminService.listAllCarOwners();
        console.log("Finished calling listAllCustomers()");
        console.log(owners)
        res.status(200).json({ success: true, data: owners });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}
// async updateCustomerStatus(req: Request, res: Response):Promise<void> {
//     try {
//         const { customerId } = req.params;
//         const { status } = req.body;

//         if (![1, 2, -1, -2, 0].includes(status)) {
//             res.status(400).json({ success: false, message: "Invalid status value" });
//             return
//         }
//         const updatedCustomer = await this._adminService.updateCustomerStatus(customerId, status);
//         if (!updatedCustomer) {
//      res.status(404).json({ success: false, message: "Customer not found" });
//      return
//         }

//         res.status(200).json({ success: true, data: updatedCustomer });
//     } catch (error: any) {
//         res.status(400).json({ success: false, message: error.message });
//     }
// }

// async updateOwnerStatus(req: Request, res: Response):Promise<void> {
//     try {
//         const { ownerId } = req.params;
//         const { status } = req.body;

//         if (![1, 2, -1, -2, 0].includes(status)) {
//             res.status(400).json({ success: false, message: "Invalid status value" });
//             return
//         }
//         const updatedOwner = await this._adminService.updateOwnerStatus(ownerId, status);
//         if (!updatedOwner) {
//      res.status(404).json({ success: false, message: "Owner not found" });
//      return
//         }
//         res.status(200).json({ success: true, data: updatedOwner });
//     } catch (error: any) {
//         res.status(400).json({ success: false, message: error.message });
//     }
// }

// async verifyCustomer(req: Request, res: Response):Promise<void> {
//     try {
//         const { customerId } = req.params;
//         const { verificationType } = req.body;
//         const verifiedCustomer = await this._adminService.verifyCustomer(customerId, verificationType);
//         res.status(200).json({ success: true, data: verifiedCustomer });
//     } catch (error: any) {
//         res.status(400).json({ success: false, message: error.message });
//     }
// }


async updateCustomerStatus(req: Request, res: Response): Promise<void> {
    // const { userId, newStatus } = req.body;

    console.log("hihihi")
    const { userId } = req.params;  
        const { status } = req.body;  
    console.log(userId, status)
        if (!userId || status === undefined) {
            res.status(400).json({ message: "Missing userId or status" });
            return
        }
    console.log(userId)
    console.log("hujuhuju,,,,....")

    try {
      const updatedUser = await this._adminService.updateCustomerStatus(userId, status);
      res.json({ message: "Status updated successfully", user: updatedUser });
    } catch (error:any) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateOwnerStatus(req: Request, res: Response): Promise<void> {
    console.log("hihihi")
    const { userId } = req.params;  
        const { status } = req.body;  
    console.log(userId, status)
        if (!userId || status === undefined) {
            res.status(400).json({ message: "Missing userId or status" });
            return
        }
    console.log(userId)
    console.log("hujuhuju,,,,....")
    try {
      const updatedUser = await this._adminService.updateOwnerStatus(userId, status);
      res.json({ message: "Status updated successfully", user: updatedUser });
    } catch (error:any) {
      res.status(500).json({ message: error.message });
    }
  }




}
export default AdminController

