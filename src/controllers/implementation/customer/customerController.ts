import { Request, Response} from "express";
import { ICustomer } from "../../../models/customer/customerModel";
import ICustomerController from "../../interfaces/customer/ICustomerContoller"
import { ICustomerService } from "../../../services/interfaces/customer/ICustomerServices";
import { CustomRequest } from "../../../middlewares/authMiddleWare";


class CustomerContoller implements ICustomerController{
    private _customerService: ICustomerService

    constructor(_customerService: ICustomerService) {
        this._customerService = _customerService
    }

    async registerBasicDetails(req: Request, res: Response): Promise<void> {
        
        try {

            const { customer } = await this._customerService.registerBasicDetails(req.body)

            res.status(201).json({ message: "OTP sent to email", email: customer.email })

        } catch (error) {
            let errorMessage = "an unexpected error occured";
            if (error instanceof Error) {
                errorMessage = error.message
            }
            res.status(400).json({ error: errorMessage })
        }
    }

    async verifyOtp(req: Request, res: Response): Promise<void> {
        try {
            const { email, otp } = req.body;

            console.log("reached pt3 ")

            const { customer } = await this._customerService.otpVerify(email, otp);
            res.status(200).json({ message: "OTP verified successfully", customer });
        } catch (error) {
            let errorMessage = "An unexpected error occurred";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            res.status(400).json({ error: errorMessage });
        }
    }

    async resendOtp (req: Request, res: Response):Promise<void>  {
        try {
            const { email } = req.body;
    
            if (!email) {
              res.status(400).json({ error: "Email is required" });
            }
    
            const customer = await this._customerService.resendOtp(email); // Resend OTP logic
    
             res.status(200).json({ message: "OTP resent successfully" });
        } catch (error) {
            let errorMessage = "An unexpected error occurred";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
             res.status(400).json({ error: errorMessage || "Failed to resend OTP" });
        }
    }

    async login(req:Request,res:Response):Promise<void>{
        try{
            console.log("reeached login1")
            const {email,password}=req.body;
            if(!email||!password){
                res.status(400).json({error:"Email and Password are required"})
            }

            const {accessToken,refreshToken,customer}= await this._customerService.loginCustomer(email,password)

            res.cookie("customerRefreshToken",refreshToken,{
                httpOnly:true,
                secure:process.env.NODE_ENV==="production",
                sameSite:"strict",
                maxAge:7*24*60*60*1000
            })
            if(!customer){
                res.status(400).json({error:"Customer not found"})
                return
            }
            res.status(200).json({
                success: true,
                message: "Login successful",
                accessToken,
                user: {
                  id: customer._id,
                  fullName: customer.fullName,
                  email: customer.email,
                  role: customer.role,  // Optional if roles exist
                }
            })
            // res.status(200).json({accessToken,customer})

        }catch(error){
            console.log("LoginError:" ,error)

            res.status(400).json({ error: error instanceof Error ? error.message : "Login failed" })
        }
    }


    async renewRefreshAccessToken(req: Request, res: Response): Promise<void> {
        try {
          const oldRefreshToken = req.cookies.customerRefreshToken;
          if (!oldRefreshToken) {
            res.status(401).json({ error: "Unauthorized" });
            return;
          }
          const { accessToken, refreshToken } = await this._customerService.renewAuthToken(oldRefreshToken)

            res.cookie("customerRefreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })
            res.status(200).json({ accessToken});
        } catch (error) {
          console.error("Token refresh error:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
    }

     async forgotPassword (req: Request, res: Response):Promise<void> {
        try {
            const { email } = req.body;
            await this._customerService.forgotPassword(email);
            res.status(200).json({ message: 'Password reset email sent' });
          } catch (error: any) {
            res.status(400).json({ message: error.message });
          }
      };



    async resetPassword(req: Request, res: Response): Promise<void>{
        try {
          const { token, newPassword } = req.body;
        
         console.log(token)
          console.log("reached pt 1")
        //   if (role !== "customer") {
        //    res.status(400).json({ message: "Invalid role" });
        //    return
        //   }
        let role="customer"
          const message = await this._customerService.resetPassword(token, newPassword, role);
          res.status(200).json({ message });
        } catch (error: any) {
          res.status(400).json({ message: error.message });
        }
      };

    async logout(req:Request,res:Response): Promise<void>{
        try{

            console.log("reached");
            const refreshToken=req.cookies.customerRefreshToken
            if(!refreshToken){
                res.status(400).json({error:"No refresh Token"})
            }
            await this._customerService.logoutCustomer(refreshToken)
            res.clearCookie("customerRefreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
              });
              res.status(200).json({ success: true, message: "Logout successful" });
        }catch (error) {
                res.status(500).json({ error: "Logout failed" });
            }
    }

    async googleSignIn(req: Request, res: Response): Promise<void> {
        try {

            console.log("*******************reached here at google signin")
          const { fullName, email, profileImage, provider, role } = req.body;
      
          console.log(profileImage)
          if (!email || !provider) {
            res.status(400).json({ message: "Missing required fields" });
            return;
          }
      
          const { accessToken, refreshToken, customer } = await this._customerService.loginCustomerGoogle(fullName, email, profileImage, provider, role);
      
         
          res.cookie("customerRefreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, 
          });
      
          if (!customer) {
            res.status(400).json({ error: "Customer not found" });
            return;
          }
      
        
          res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            user: {
              id: customer._id,
              fullName: customer.fullName,
              email: customer.email,
              profileImage:customer.profileImage,
              role: customer.role,
            },
          });
        } catch (error) {
          console.log("LoginError:", error);
          res.status(400).json({ error: error instanceof Error ? error.message : "Login failed" });
        }
      }

      async googleSignOut(req:Request,res:Response):Promise<void>{
         

      }


      async getCustomerProfile(req: CustomRequest, res: Response): Promise<void> {
              try {
                  console.log("helloooooo")
              const customerId = req.userId;
              console.log(customerId)
            
                if (!customerId) {
                  console.log("hdhuhdi")
                  res.status(401).json({ success: false, message: "Unauthorized" });
                  return;
                }
                const customerProfile = await this._customerService.getCustomerProfile(customerId);
                console.log(customerProfile)
                res.status(200).json({ success: true, customer: customerProfile });
              } catch (error) {
                console.error("Error fetching profile:", error);
                res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Internal Server Error" });
              }
            }
      
      
      
            async updateProfileCustomer(req: CustomRequest, res: Response): Promise<void> {
              try {
                const customerId = req.userId;
                console.log("reached heriii")
                console.log(customerId)
                if(!customerId){
                  res.status(403).json({message: "Forbidden: No customer ID found"})
                   return  
              }
                const { phoneNumber, address, profileImage } = req.body;
                if (!phoneNumber && !address) {
                  res.status(400).json({ message: "No data provided to update." });
                  return 
                }
                const updatedCustomer = await this._customerService.updateCustomerProfile(customerId, { phoneNumber, address, profileImage });
                res.status(200).json({ message: "Profile updated successfully", updatedCustomer });
              } catch (error: any) {
                console.error("Error updating profile:", error.message);
                res.status(500).json({ message: error.message });
              }
            }
      
            async updateProfileCustomerIdProof(req: CustomRequest, res: Response): Promise<void> {
              try {
                const customerId = req.userId;
                console.log("reached heriii")
                console.log(customerId)
                if(!customerId){
                  res.status(403).json({message: "Forbidden: No customer ID found"})
                   return  
              }
                const { idProof } = req.body;
                console.log("id",idProof)
                if (!idProof) {
                  console.log("error1")
                  res.status(400).json({ message: "No data provided to update." });
                  return 
                }
          
                const updatedCustomer = await this._customerService.updateCustomerProfileId(customerId, {idProof});
                
                res.status(200).json({ message: "IdProof updated successfully", updatedCustomer });
              } catch (error: any) {
                console.error("Error updating profile:", error.message);
                res.status(500).json({ message: error.message });
              }
            }
      

}



export default CustomerContoller


