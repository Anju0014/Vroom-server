import { Request, Response } from "express"
import {ICar,Car} from '../../../models/car/carModel'
import { ICarOwner } from "../../../models/carowner/carOwnerModel";
import ICarOwnerController from "../../interfaces/carowner/ICarOwnerContoller"
import { ICarOwnerService } from '../../../services/interfaces/carOwner/ICarOwnerServices';
import { CustomRequest } from "../../../middlewares/authMiddleWare";
import { MESSAGES } from "../../../constants/message";
import { StatusCode } from "../../../constants/statusCode";


class CarOwnerController implements ICarOwnerController{
    private _carOwnerService: ICarOwnerService

    constructor(_carOwnerService: ICarOwnerService) {
        this._carOwnerService = _carOwnerService
    }

    async registerBasicDetailsOwner(req: Request, res: Response): Promise<void> {
        
        try {
            const { carOwner } = await this._carOwnerService.registerBasicDetails(req.body)

            res.status(StatusCode.CREATED).json({
              success: true,
              message: MESSAGES.SUCCESS.OTP_SENT,
              email: carOwner.email,
            });

        } catch (error) {
          this.handleError(res, error, StatusCode.BAD_REQUEST);
        
        }
    }

    async verifyOtpOwner(req: Request, res: Response): Promise<void> {
        try {
            const { email, otp } = req.body;

            console.log("reached pt3 ")

            const { carOwner } = await this._carOwnerService.otpVerify(email, otp);
            res.status(StatusCode.OK).json({
              success: true,
              message: MESSAGES.SUCCESS.OTP_VERIFIED,
              carOwner,
            });
        } catch (error) {
          this.handleError(res, error, StatusCode.BAD_REQUEST);
           
        }
    }

    async resendOtpOwner (req: Request, res: Response):Promise<void>  {
        try {
            const { email } = req.body;
    
            if (!email) {
            
              res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.EMAIL_REQUIRED });
              return
            }
    
            const carOwner= await this._carOwnerService.resendOtp(email); // Resend OTP logic
    
            //  res.status(200).json({ message: "OTP resent successfully" });

            res.status(StatusCode.OK).json({ success: true, message: MESSAGES.SUCCESS.OTP_RESENT });
        } catch (error) {
          this.handleError(res, error, StatusCode.BAD_REQUEST);
            // let errorMessage = "An unexpected error occurred";
            // if (error instanceof Error) {
            //     errorMessage = error.message;
            // }
            //  res.status(400).json({ error: errorMessage || "Failed to resend OTP" });
        }
    }

    async loginOwner(req:Request,res:Response):Promise<void>{
        try{
            console.log("reeached login1")
            const {email,password}=req.body;
            if(!email||!password){
              res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.MISSING_FIELDS });
              return
            }

            const {ownerAccessToken,refreshToken,carOwner}= await this._carOwnerService.loginCarOwner(email,password)

            res.cookie("carOwnerRefreshToken",refreshToken,{
                httpOnly:true,
                secure:process.env.NODE_ENV==="production",
                sameSite:"strict",
                maxAge:7*24*60*60*1000
            })
            res.cookie("carOwnerAccessToken", ownerAccessToken,{
              httpOnly:true,
              secure:process.env.NODE_ENV==="production",
              sameSite:"strict",
              maxAge:60*60*1000
          })
            if(!carOwner){
                res.status(400).json({error:"carOwner not found"})
                return
            }
            res.status(StatusCode.OK).json({
              success: true,
              message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
              ownerAccessToken,
              user: {
                id: carOwner._id,
                fullName: carOwner.fullName,
                email: carOwner.email,
                role: carOwner.role,
                profileImage: carOwner.profileImage,
              },
            });

        }catch(error){
          console.log(error)
          this.handleError(res, error, StatusCode.BAD_REQUEST);
            // console.log("LoginError:" ,error)

            // res.status(400).json({ error: error instanceof Error ? error.message : "Login failed" })
        }
    }


    // async renewRefreshAccessTokenOwner(req: Request, res: Response): Promise<void> {
    //     try {
    //         console.log("hellooooooo mi at carowner")
    //       const oldRefreshToken = req.cookies.carOwnerRefreshToken;
    //       if (!oldRefreshToken) {
    //         res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: MESSAGES.ERROR.UNAUTHORIZED });
    //         // res.status(401).json({ error: "Unauthorized" });
    //         return;
    //       }
    //       const { accessToken, refreshToken } = await this._carOwnerService.renewAuthToken(oldRefreshToken)

    //         res.cookie("carOwnerRefreshToken", refreshToken, {
    //             httpOnly: true,
    //             secure: process.env.NODE_ENV === "production",
    //             sameSite: "strict",
    //             maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    //         })
          
    //         res.status(StatusCode.OK).json({ success: true, accessToken });
    //     } catch (error) {
    //       console.error("Error renewing token:", error);
    //     this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
          
    //     }
    // }






    async renewRefreshAccessTokenOwner(req: Request, res: Response): Promise<void> {
      try {
        console.log("Reached renewRefreshAccessTokenOwner");
        const oldRefreshToken = req.cookies.carOwnerRefreshToken;
        if (!oldRefreshToken) {
          res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: MESSAGES.ERROR.UNAUTHORIZED });
          return;
        }
    
        const { accessToken, refreshToken } = await this._carOwnerService.renewAuthToken(oldRefreshToken);
    
        res.cookie("carOwnerRefreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    
        res.cookie("carOwnerAccessToken",accessToken,{
          httpOnly:true,
          secure:process.env.NODE_ENV==="production",
          sameSite:"strict",
          maxAge:60*60*1000
      })
        res.status(StatusCode.OK).json({ success: true, accessToken });
      } catch (error) {
        if(error instanceof Error){
        console.error("Error renewing token:", error.message);
        if (error.message === "Refresh token expired" || error.message === "Invalid refresh token") {
          res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: "Invalid or expired refresh token" });
        } else {
          this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
        }}
      }
    }




//     async renewRefreshAccessTokenOwner(req: Request, res: Response): Promise<void> {
//   try {
//     console.log("Reached renewRefreshAccessTokenOwner");
//     const oldRefreshToken = req.cookies.carOwnerRefreshToken;
//     if (!oldRefreshToken) {
//       res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: MESSAGES.ERROR.UNAUTHORIZED });
//       return;
//     }

//     const { accessToken, refreshToken } = await this._carOwnerService.renewAuthToken(oldRefreshToken);

//     res.cookie("carOwnerRefreshToken", refreshToken, {
//       httpOnly: process.env.COOKIE_HTTP_ONLY === "true",
//       secure: process.env.COOKIE_SECURE === "true",
//       sameSite: process.env.COOKIE_SAME_SITE as "strict" | "lax" | "none",
//       maxAge: Number(process.env.COOKIE_REFRESH_MAX_AGE),
//     });

//     res.cookie("carOwnerAccessToken", accessToken, {
//       httpOnly: process.env.COOKIE_HTTP_ONLY === "true",
//       secure: process.env.COOKIE_SECURE === "true",
//       sameSite: process.env.COOKIE_SAME_SITE as "strict" | "lax" | "none",
//       maxAge: Number(process.env.COOKIE_ACCESS_MAX_AGE),
//     });

//     res.status(StatusCode.OK).json({ success: true, accessToken });
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error("Error renewing token:", error.message);
//       if (error.message === "Refresh token expired" || error.message === "Invalid refresh token") {
//         res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: "Invalid or expired refresh token" });
//       } else {
//         this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
//       }
//     }
//   }
// }


    async completeRegistration(req: CustomRequest, res: Response): Promise<void> {
    // async completeRegistration(req:CustomRequest,res:Request): Promise<void>{
      try{

        console.log("reached at new Registratipo")


        console.log("show what error",req.body)
        const carOwnerId = req.userId;
          console.log("id?",carOwnerId)
          console.log("data from frontend",req.body)
          console.log(carOwnerId)
          if(!carOwnerId){
            res.status(StatusCode.FORBIDDEN).json({
              success: false,
              message: MESSAGES.ERROR.NO_OWNER_ID_FOUND
          });
            // res.status(403).json({message: "Forbidden: No car owner ID found"})
             return  
        }

        const completeOwner= await this._carOwnerService.completeRegister(carOwnerId,req.body)
        res.status(StatusCode.OK).json({
          success: true,
          message: MESSAGES.SUCCESS.COMPLETED_REGISTRATION_FORM,
          completeOwner
      });
    
    }catch(error){
      this.handleError(res, error, StatusCode.BAD_REQUEST);

    }
    }
     async forgotPasswordOwner (req: Request, res: Response):Promise<void> {
        try {
            const { email } = req.body;
            if (!email) {
              res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.EMAIL_REQUIRED });
              return;
          }
            await this._carOwnerService.forgotPassword(email);
            // res.status(200).json({ message: 'Password reset email sent' });
            res.status(StatusCode.OK).json({ success: true, message: MESSAGES.SUCCESS.PASSWORD_RESET_SENT });
          } catch (error) {
            console.error("Forgot password error:", error);
            this.handleError(res, error, StatusCode.BAD_REQUEST);
            // res.status(400).json({ message: error.message });
          }
      };



    async resetPasswordOwner(req: Request, res: Response): Promise<void>{
        try {
          const { token, newPassword } = req.body;
        
         console.log(token)
          console.log("reached pt 1")
     
          if (!token || !newPassword) {
            res.status(StatusCode.BAD_REQUEST).json({ 
                success: false, 
                message: MESSAGES.ERROR.MISSING_FIELDS 
            });
            return;
        }
        let role="carOwner"
          const message = await this._carOwnerService.resetPassword(token, newPassword, role);
          // res.status(200).json({ message });
          res.status(StatusCode.OK).json({ 
            success: true, 
            message 
        });

        } catch (error) {
          console.error("Reset Password Error:", error);
        this.handleError(res, error, StatusCode.BAD_REQUEST);
          // res.status(400).json({ message: error.message });
        }
      };


    async changePasswordOwner(req: CustomRequest, res: Response): Promise<void> {
      try {
          const ownerId = req.userId; // Set in middleware
          console.log()
          if (!ownerId) {
              res.status(StatusCode.UNAUTHORIZED).json({
                  success: false,
                  message: MESSAGES.ERROR.UNAUTHORIZED,
              });
              return;
          }
          const result = await this._carOwnerService.changePassword(ownerId, req.body);
          if (!result.success) {
              res.status(StatusCode.BAD_REQUEST).json(result);
              return;
          }
          res.status(StatusCode.OK).json(result);
      } catch (error) {
        this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
      }
  }
  

      async logout(req:Request,res:Response): Promise<void>{
        try{
            const refreshToken=req.cookies.carOwnerRefreshToken
        
            if (!refreshToken) {
              res.status(StatusCode.BAD_REQUEST).json({ 
                  success: false, 
                  message: MESSAGES.ERROR.NO_REFRESH_TOKEN 
              });
              return;
          }
            await this._carOwnerService.logoutCarOwner(refreshToken)
            res.clearCookie("carOwnerRefreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
              });

              res.status(StatusCode.OK).json({ 
                success: true, 
                message: MESSAGES.SUCCESS.LOGOUT_SUCCESS 
            });
    
              // res.status(200).json({ success: true, message: "Logout successful" });
        }catch (error) {
          console.error("Logout Error:", error);
        this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
                // res.status(500).json({ error: "Logout failed" });
            }
    }
      





    async googleSignIn(req: Request, res: Response): Promise<void> {
        try {

            console.log("reached here at google signin")
          const { fullName, email, profileImage, provider, role } = req.body;
      
          if (!email || !provider) {
            // res.status(400).json({ message: "Missing required fields" });
            res.status(StatusCode.BAD_REQUEST).json({
              success: false,
              message: MESSAGES.ERROR.MISSING_FIELDS
          });
            return;
          }
      
          const { ownerAccessToken, refreshToken, carOwner } = await this._carOwnerService.loginOwnerGoogle(fullName, email, profileImage, provider, role);
      
         
          res.cookie("carOwnerRefreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, 
          });
      
          if (!carOwner) {
            res.status(StatusCode.NOT_FOUND).json({
              success: false,
              message: MESSAGES.ERROR.CUSTOMER_NOT_FOUND
          });
            return;
          }
      
          res.status(StatusCode.OK).json({
            success: true,
            message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
            ownerAccessToken,
            user: {
                id: carOwner._id,
                fullName: carOwner.fullName,
                email: carOwner.email,
                role: carOwner.role,
                profileImage: carOwner.profileImage
            },
        });
          // res.status(200).json({
          //   success: true,
          //   message: "Login successful",
          //   accessToken,
          //   user: {
          //     id: carOwner._id,
          //     fullName: carOwner.fullName,
          //     email: carOwner.email,
          //     role: carOwner.role,
          //     profileImage:carOwner.profileImage
          //   },
          // });
        } catch (error) {
          console.error("Google Sign-In Error:", error);
        this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
          // console.log("LoginError:", error);
          // res.status(400).json({ error: error instanceof Error ? error.message : "Login failed" });
        }
      }


      async getOwnerProfile(req: CustomRequest, res: Response): Promise<void> {
        try {
            console.log("helloooooo")
        const ownerId = req.userId;
        console.log(ownerId)
        // const ownerId='134';
          if (!ownerId) {
            // res.status(401).json({ success: false, message: "Unauthorized" });
            res.status(StatusCode.UNAUTHORIZED).json({
              success: false,
              message: MESSAGES.ERROR.UNAUTHORIZED
          });
            return;
          }
          const ownerProfile = await this._carOwnerService.getOwnerProfile(ownerId);
          if (!ownerProfile) {
            res.status(StatusCode.NOT_FOUND).json({
                success: false,
                message: MESSAGES.ERROR.PROFILE_NOT_FOUND
            });
            return;
        }
        res.status(StatusCode.OK).json({
          success: true,
          owner: ownerProfile
      });

          // res.status(200).json({ success: true, owner: ownerProfile });
        } catch (error) {
          console.error("Error fetching profile:", error);
        this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
          // res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Internal Server Error" });
        }
      }



      async updateProfileOwner(req: CustomRequest, res: Response): Promise<void> {
        try {
          const carOwnerId = req.userId;
          console.log("reached heriii")
          console.log(carOwnerId)
          if(!carOwnerId){
            res.status(StatusCode.FORBIDDEN).json({
              success: false,
              message: MESSAGES.ERROR.NO_OWNER_ID_FOUND
          });
            // res.status(403).json({message: "Forbidden: No car owner ID found"})
             return  
        }
          const { phoneNumber, address, profileImage } = req.body;
          if (!phoneNumber && !address) {
            // res.status(400).json({ message: "No data provided to update." });
            res.status(StatusCode.BAD_REQUEST).json({
              success: false,
              message: MESSAGES.ERROR.NO_UPDATE_DATA
          });
            return 
          }
          const updatedOwner = await this._carOwnerService.updateCarOwnerProfile(carOwnerId, { phoneNumber, address, profileImage });
          // res.status(200).json({ message: "Profile updated successfully", updatedOwner });
          res.status(StatusCode.OK).json({
            success: true,
            message: MESSAGES.SUCCESS.PROFILE_UPDATED,
            updatedOwner
        });
        } catch (error) {
          console.error("Error updating profile:", error);
          this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
        }
      }

      // async updateProfileOwnerIdProof(req: CustomRequest, res: Response): Promise<void> {
      //   try {
      //     const carOwnerId = req.userId;
      //     console.log("reached heriii")
      //     console.log(carOwnerId)
      //     if(!carOwnerId){
      //       res.status(StatusCode.FORBIDDEN).json({
      //         success: false,
      //         message: MESSAGES.ERROR.NO_OWNER_ID_FOUND
      //     });
      //       // res.status(403).json({message: "Forbidden: No car owner ID found"})
      //        return  
      //   }
      //     const { idProof } = req.body;
      //     console.log("id",idProof)
      //     if (!idProof) {
      //       console.log("error1")
      //       res.status(StatusCode.BAD_REQUEST).json({
      //         success: false,
      //         message: MESSAGES.ERROR.NO_UPDATE_DATA
      //     });
      //       // res.status(400).json({ message: "No data provided to update." });
      //       return 
      //     }
    
      //     const updatedOwner = await this._carOwnerService.updateCarOwnerProfileId(carOwnerId, {idProof});
          
      //     res.status(StatusCode.OK).json({
      //       success: true,
      //       message: MESSAGES.SUCCESS.ID_PROOF_UPDATED,
      //       updatedOwner
      //   });

      //     // res.status(200).json({ message: "IdProof updated successfully", updatedOwner });
      //   } catch (error) {
      //     console.error("Error updating ID Proof:", error);
      //     this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
      //   }
      // }



      

      





      private handleError(res: Response, error: unknown, statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR): void {
        console.error("Error:", error);

        const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.SERVER_ERROR;

        res.status(statusCode).json({
            success: false,
            message: errorMessage,
        });
    }
    }
    
    export default CarOwnerController