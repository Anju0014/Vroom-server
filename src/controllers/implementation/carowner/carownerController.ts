import { Request, Response } from "express"
import { ICarOwner } from "../../../models/carowner/carOwnerModel";
import ICarOwnerController from "../../interfaces/carowner/ICarOwnerContoller"
import { ICarOwnerService } from '../../../services/interfaces/carOwner/ICarOwnerServices';


class CarOwnerController implements ICarOwnerController{
    private _carOwnerService: ICarOwnerService

    constructor(_carOwnerService: ICarOwnerService) {
        this._carOwnerService = _carOwnerService
    }

    async registerBasicDetailsOwner(req: Request, res: Response): Promise<void> {
        
        try {

            const { carOwner } = await this._carOwnerService.registerBasicDetails(req.body)

            res.status(201).json({ message: "OTP sent to email", email: carOwner.email })

        } catch (error) {
            let errorMessage = "an unexpected error occured";
            if (error instanceof Error) {
                errorMessage = error.message
            }
            res.status(400).json({ error: errorMessage })
        }
    }

    async verifyOtpOwner(req: Request, res: Response): Promise<void> {
        try {
            const { email, otp } = req.body;

            console.log("reached pt3 ")

            const { carOwner } = await this._carOwnerService.otpVerify(email, otp);
            res.status(200).json({ message: "OTP verified successfully", carOwner });
        } catch (error) {
            let errorMessage = "An unexpected error occurred";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            res.status(400).json({ error: errorMessage });
        }
    }

    async resendOtpOwner (req: Request, res: Response):Promise<void>  {
        try {
            const { email } = req.body;
    
            if (!email) {
              res.status(400).json({ error: "Email is required" });
            }
    
            const carOwner= await this._carOwnerService.resendOtp(email); // Resend OTP logic
    
             res.status(200).json({ message: "OTP resent successfully" });
        } catch (error) {
            let errorMessage = "An unexpected error occurred";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
             res.status(400).json({ error: errorMessage || "Failed to resend OTP" });
        }
    }

    async loginOwner(req:Request,res:Response):Promise<void>{
        try{
            console.log("reeached login1")
            const {email,password}=req.body;
            if(!email||!password){
                res.status(400).json({error:"Email and Password are required"})
            }

            const {accessToken,refreshToken,carOwner}= await this._carOwnerService.loginCarOwner(email,password)

            res.cookie("carOwnerRefreshToken",refreshToken,{
                httpOnly:true,
                secure:process.env.NODE_ENV==="production",
                sameSite:"strict",
                maxAge:7*24*60*60*1000
            })
            if(!carOwner){
                res.status(400).json({error:"carOwner not found"})
                return
            }
            res.status(200).json({
                success: true,
                message: "Login successful",
                accessToken,
                user: {
                  id:carOwner._id,
                  fullName: carOwner.fullName,
                  email: carOwner.email,
                  role: carOwner.role,  // Optional if roles exist
                }
            })
           

        }catch(error){
            console.log("LoginError:" ,error)

            res.status(400).json({ error: error instanceof Error ? error.message : "Login failed" })
        }
    }


    async renewRefreshAccessTokenOwner(req: Request, res: Response): Promise<void> {
        try {
          const oldRefreshToken = req.cookies.carOwnerRefreshToken;
          if (!oldRefreshToken) {
            res.status(401).json({ error: "Unauthorized" });
            return;
          }
          const { accessToken, refreshToken } = await this._carOwnerService.renewAuthToken(oldRefreshToken)

            res.cookie("carOwnerRefreshToken", refreshToken, {
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

     async forgotPasswordOwner (req: Request, res: Response):Promise<void> {
        try {
            const { email } = req.body;
            await this._carOwnerService.forgotPassword(email);
            res.status(200).json({ message: 'Password reset email sent' });
          } catch (error: any) {
            res.status(400).json({ message: error.message });
          }
      };



    async resetPasswordOwner(req: Request, res: Response): Promise<void>{
        try {
          const { token, newPassword } = req.body;
        
         console.log(token)
          console.log("reached pt 1")
     
        let role="carOwner"
          const message = await this._carOwnerService.resetPassword(token, newPassword, role);
          res.status(200).json({ message });
        } catch (error: any) {
          res.status(400).json({ message: error.message });
        }
      };
      async logout(req:Request,res:Response): Promise<void>{
        try{
            const refreshToken=req.cookies.carOwnerRefreshToken
            if(!refreshToken){
                res.status(400).json({error:"No refresh Token"})
            }
            await this._carOwnerService.logoutCarOwner(refreshToken)
            res.clearCookie("carOwnerRefreshToken", {
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

            console.log("reached here at google signin")
          const { fullName, email, image, provider, role } = req.body;
      
          if (!email || !provider) {
            res.status(400).json({ message: "Missing required fields" });
            return;
          }
      
          const { accessToken, refreshToken, carOwner } = await this._carOwnerService.loginOwnerGoogle(fullName, email, image, provider, role);
      
         
          res.cookie("carOwnerRefreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, 
          });
      
          if (!carOwner) {
            res.status(400).json({ error: "Customer not found" });
            return;
          }
      
        
          res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            user: {
              id: carOwner._id,
              fullName: carOwner.fullName,
              email: carOwner.email,
              role: carOwner.role,
            },
          });
        } catch (error) {
          console.log("LoginError:", error);
          res.status(400).json({ error: error instanceof Error ? error.message : "Login failed" });
        }
      }

    
      




    
    }

    export default CarOwnerController