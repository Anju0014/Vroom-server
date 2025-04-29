import { Request, Response} from "express";
import { ICustomer } from "../../../models/customer/customerModel";
import ICustomerController from "../../interfaces/customer/ICustomerContoller"
import { ICustomerService } from "../../../services/interfaces/customer/ICustomerServices";
import { CustomRequest } from "../../../middlewares/authMiddleWare";
import { MESSAGES } from "../../../constants/message";
import { StatusCode } from "../../../constants/statusCode";


class CustomerContoller implements ICustomerController{
    private _customerService: ICustomerService

    constructor(_customerService: ICustomerService) {
        this._customerService = _customerService
    }

    async registerBasicDetails(req: Request, res: Response): Promise<void> {
        try {
            const { customer } = await this._customerService.registerBasicDetails(req.body)

            // res.status(201).json({ message: "OTP sent to email", email: customer.email })
            res.status(StatusCode.CREATED).json({
              success: true,
              message: MESSAGES.SUCCESS.OTP_SENT,
              email: customer.email,
            });
        } catch (error) {
          this.handleError(res, error, StatusCode.BAD_REQUEST);
        //     let errorMessage = "an unexpected error occured";
        //     if (error instanceof Error) {
        //         errorMessage = error.message
        //     }
        //     res.status(400).json({ error: errorMessage })
         }
    }

    async verifyOtp(req: Request, res: Response): Promise<void> {
        try {
            const { email, otp } = req.body;

            console.log("reached pt3 ")

            const { customer } = await this._customerService.otpVerify(email, otp);
            res.status(StatusCode.OK).json({
              success: true,
              message: MESSAGES.SUCCESS.OTP_VERIFIED, customer });
        } catch (error) {
          this.handleError(res, error, StatusCode.BAD_REQUEST);
        }
    }

    async resendOtp (req: Request, res: Response):Promise<void>  {
        try {
            const { email } = req.body;
    
            if (!email) {
              res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.EMAIL_REQUIRED });
              return
            }
    
            const customer = await this._customerService.resendOtp(email); // Resend OTP logic
    
            res.status(StatusCode.OK).json({ success: true, message: MESSAGES.SUCCESS.OTP_RESENT });
        } catch (error) {
          this.handleError(res, error, StatusCode.BAD_REQUEST);
        }
    }

    async login(req:Request,res:Response):Promise<void>{
        try{
            console.log("reeached login1")
            const {email,password}=req.body;
            if(!email||!password){
              res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.MISSING_FIELDS });
              return
            }

            const {customerAccessToken,refreshToken,customer}= await this._customerService.loginCustomer(email,password)

            res.cookie("customerRefreshToken",refreshToken,{
                httpOnly:true,
                secure:process.env.NODE_ENV==="production",
                sameSite:"strict",
                maxAge:7*24*60*60*1000
            })
           res.cookie("customerAccessToken",customerAccessToken,{
              httpOnly:true,
              secure:process.env.NODE_ENV==="production",
              sameSite:"strict",
              maxAge:60*60*1000
          })
            if(!customer){
                res.status(400).json({error:"Customer not found"})
                return
            }
            res.status(StatusCode.OK).json({
              success: true,
              message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
              customerAccessToken,
                user: {
                  id: customer._id,
                  fullName: customer.fullName,
                  email: customer.email,
                  role: customer.role,
                  profileImage: customer.profileImage,  // Optional if roles exist
                }
            })
            // res.status(200).json({accessToken,customer})

        }catch(error){
          this.handleError(res, error, StatusCode.BAD_REQUEST);
        }
    }


    async renewRefreshAccessToken(req: Request, res: Response): Promise<void> {
        try {
          console.log("reached here at renewal")
          const oldRefreshToken = req.cookies.customerRefreshToken;
          if (!oldRefreshToken) {
            res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: MESSAGES.ERROR.UNAUTHORIZED });
            // res.status(401).json({ error: "Unauthorized" });
            return;
          }
          const { accessToken, refreshToken } = await this._customerService.renewAuthToken(oldRefreshToken)

            res.cookie("customerRefreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })
            res.cookie("customerAccessToken", accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              maxAge: 60 * 60 * 1000 // 7 days
          })
            // res.status(200).json({ accessToken});
            res.status(StatusCode.OK).json({ success: true,accessToken });
        } catch (error) {
          this.handleError(res, error, StatusCode.BAD_REQUEST);
        }
    }

     async forgotPassword (req: Request, res: Response):Promise<void> {
        try {
            const { email } = req.body;
            if (!email) {
                          res.status(StatusCode.BAD_REQUEST).json({ success: false, message: MESSAGES.ERROR.EMAIL_REQUIRED });
                          return;
                      }
            await this._customerService.forgotPassword(email);
            // res.status(200).json({ message: 'Password reset email sent' });
            res.status(StatusCode.OK).json({ success: true, message: MESSAGES.SUCCESS.PASSWORD_RESET_SENT });
                    
          } catch (error) {
            this.handleError(res, error, StatusCode.BAD_REQUEST);
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

        if (!token || !newPassword) {
          res.status(StatusCode.BAD_REQUEST).json({ 
              success: false, 
              message: MESSAGES.ERROR.MISSING_FIELDS 
          });
          return;
      }
        let role="customer"
          const message = await this._customerService.resetPassword(token, newPassword, role);
          // res.status(200).json({ message });
          res.status(StatusCode.OK).json({ 
            success: true, 
            message 
        });

        } catch (error) {
          this.handleError(res, error, StatusCode.BAD_REQUEST);
        }
      };

       async changePassword(req: CustomRequest, res: Response): Promise<void> {
            try {
                const customerId = req.userId; // Set in middleware
                console.log("reached at change password")
                console.log(customerId)
                if (!customerId) {
                  console.log("reached  noy at change password")
                    res.status(StatusCode.UNAUTHORIZED).json({
                        success: false,
                        message: MESSAGES.ERROR.UNAUTHORIZED,
                    });
                    return;
                }
                const message = await this._customerService.changePassword(customerId, req.body);
             
                res.status(StatusCode.OK).json({
                  success: true,
                  message
                });
            } catch (error:unknown) {
              if(error instanceof Error){
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                  success:false,
                  message:error.message
                });

              }
             

            }
        }
        

    async logout(req:Request,res:Response): Promise<void>{
        try{

            console.log("reached");
            const refreshToken=req.cookies.customerRefreshToken
            // if(!refreshToken){
            //     res.status(400).json({error:"No refresh Token"})
            // }
            if (!refreshToken) {
              res.status(StatusCode.BAD_REQUEST).json({ 
                  success: false, 
                  message: MESSAGES.ERROR.NO_REFRESH_TOKEN 
              });
              return;
          }
            await this._customerService.logoutCustomer(refreshToken)
            res.clearCookie("customerRefreshToken", {
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
          this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
            }
    }

    async googleSignIn(req: Request, res: Response): Promise<void> {
        try {

            console.log("*******************reached here at google signin")
          const { fullName, email, profileImage, provider, role } = req.body;
      
          console.log(profileImage)
          if (!email || !provider) {
            // res.status(400).json({ message: "Missing required fields" });
            res.status(StatusCode.BAD_REQUEST).json({
              success: false,
              message: MESSAGES.ERROR.MISSING_FIELDS
          });
            return;
          }
      
          const { customerAccessToken, refreshToken, customer } = await this._customerService.loginCustomerGoogle(fullName, email, profileImage, provider, role);
      
         
          res.cookie("customerRefreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, 
          });

          res.cookie("customerAccessToken", customerAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 1000, 
          });
      
          if (!customer) {
            res.status(400).json({ error: "Customer not found" });
            return;
          }
      
        
          res.status(200).json({
            success: true,
            message: "Login successful",
            customerAccessToken,
            user: {
              id: customer._id,
              fullName: customer.fullName,
              email: customer.email,
              profileImage:customer.profileImage,
              role: customer.role,
            },
          });
        } catch (error) {
          this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
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
                  res.status(StatusCode.UNAUTHORIZED).json({
                    success: false,
                    message: MESSAGES.ERROR.UNAUTHORIZED
                });
                  
                  // res.status(401).json({ success: false, message: "Unauthorized" });
                  return;
                }
                // const customerProfile = await this._customerService.getCustomerProfile(customerId);
                // console.log("checking",customerProfile)
                // // const customerProfile = await this._customerService.getCustomerProfile(customerId);

                // const mappedCustomer = {
                //   id: customerProfile.customer._id,
                //   fullName: customerProfile.customer.fullName,
                //   email: customerProfile.customer.email,
                //   phoneNumber: customerProfile.customer.phoneNumber,
                //   isVerified: customerProfile.customer.isVerified,
                //   role: customerProfile.customer.role,
                //   processStatus: customerProfile.customer.processStatus,
                //   blockStatus: customerProfile.customer.blockStatus,
                //   verifyStatus: customerProfile.customer.verifyStatus,
                //   status: customerProfile.customer.status,
                //   idVerified: customerProfile.customer.idVerified,
                //   idProof: customerProfile.customer.idProof,
                //   createdAt: customerProfile.customer.createdAt,
                //   updatedAt: customerProfile.customer.updatedAt,
                // };
            
               
                const { customer } = await this._customerService.getCustomerProfile(customerId);
                const mappedCustomer = {
                  id: customer._id,
                  fullName: customer.fullName,
                  email: customer.email,
                  phoneNumber: customer.phoneNumber,
                  isVerified: customer.isVerified,
                  role: customer.role,
                  processStatus: customer.processStatus,
                  blockStatus: customer.blockStatus,
                  verifyStatus: customer.verifyStatus,
                  status: customer.status,
                  idVerified: customer.idVerified,
                  idProof: customer.idProof,
                  createdAt: customer.createdAt,
                  updatedAt: customer.updatedAt,
                };
                 res.status(StatusCode.OK).json({

                  success: true,
                  customer: mappedCustomer,
                });
                // res.status(StatusCode.OK).json({
                //   success: true,customer: customerProfile });
              } catch (error) {
                this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
              }
            }
      
      
      
            async updateProfileCustomer(req: CustomRequest, res: Response): Promise<void> {
              try {
                const customerId = req.userId;
                console.log("reached heriii")
                console.log(customerId)
                if(!customerId){
                  res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: MESSAGES.ERROR.NO_CUSTOMER_ID_FOUND
                });
              return}
                const { phoneNumber, address, profileImage } = req.body;
                if (!phoneNumber && !address) {
                  res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: MESSAGES.ERROR.NO_UPDATE_DATA
                });
                  return 
                }
                const updatedCustomer = await this._customerService.updateCustomerProfile(customerId, { phoneNumber, address, profileImage });
                res.status(200).json({ message: "Profile updated successfully", updatedCustomer });
              } catch (error) {
                this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
              }
            }
      
            async updateProfileCustomerIdProof(req: CustomRequest, res: Response): Promise<void> {
              try {
                const customerId = req.userId;
                console.log("reached heriii")
                console.log(customerId)
                if(!customerId){
                  res.status(StatusCode.FORBIDDEN).json({
                    success: false,
                    message: MESSAGES.ERROR.NO_CUSTOMER_ID_FOUND
                });
                   return  
              }
                const { idProof } = req.body;
                console.log("id",idProof)
                if (!idProof) {
                  console.log("error1")
                  // res.status(400).json({ message: "No data provided to update." });
                  res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: MESSAGES.ERROR.NO_UPDATE_DATA
                });
                  return 
                }
          
                const updatedCustomer = await this._customerService.updateCustomerProfileId(customerId, {idProof});
                
                res.status(StatusCode.OK).json({
                  success: true,
                  message: MESSAGES.SUCCESS.ID_PROOF_UPDATED, updatedCustomer });
              } catch (error) {
                this.handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
              }
            }



            private handleError(res: Response, error: unknown, statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR): void {
              console.error("Error:", error);
      
              const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.SERVER_ERROR;
      
              res.status(statusCode).json({
                  success: false,
                  message: errorMessage,
              });
          }
      

}



export default CustomerContoller


