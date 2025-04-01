import IAdminRepository from "../../../repositories/interfaces/admin/IAdminRepository";
import { IAdminService } from "../../interfaces/admin/IAdminServices";
import { IAdmin } from "../../../models/admin/adminModel";
import PasswordUtils from "../../../utils/passwordUtils";
import JwtUtils from "../../../utils/jwtUtils";
import { ICustomer } from "../../../models/customer/customerModel";
import { ICarOwner } from "../../../models/carowner/carOwnerModel";


class AdminService implements IAdminService {

    private _adminRepository : IAdminRepository;

    constructor(adminRepository:IAdminRepository){
        this._adminRepository=adminRepository
    }
async loginAdmin(email:string, password:string): Promise<{accessToken:string,refreshToken:string,admin:IAdmin|null}>{
    console.log(`checking login things`);
    const admin=await this._adminRepository.findUserByEmail(email);
    console.log(admin)
    if(!admin){
        console.log("not correct user")
        throw new Error("Invalid Credentials");
    }
    const passwordTrue = await PasswordUtils.comparePassword(password,admin.password)
    if(!passwordTrue){
        console.log("not correct")
        throw new Error("Invalid Credentials")
    }
    const accessToken=JwtUtils.generateAccessToken({id:admin._id, email:admin.email});
    const newRefreshToken=JwtUtils.generateRefreshToken({id:admin._id});

    await this._adminRepository.updateRefreshToken(admin._id.toString(), newRefreshToken);
    const admin2 = await this._adminRepository.findUserByRefreshToken(newRefreshToken);
    console.log(admin2)
    console.log(newRefreshToken)

    return {accessToken,refreshToken:newRefreshToken,admin}
}


async logoutAdmin(refreshToken: string): Promise<void> {
   
    console.log(refreshToken)
    const admin = await this._adminRepository.findUserByRefreshToken(refreshToken);
    console.log(admin)
  if (!admin) {
    console.log("error")
    throw new Error("User not found");
  }
  await this._adminRepository.clearRefreshToken(admin._id.toString());
}


async listAllCustomers(): Promise<ICustomer[]> {
    try {
        console.log("reached222");
        return await this._adminRepository.getAllCustomers();
    } catch (error) {
        console.error("Error in listAllCustomers:", error);
        throw new Error("Failed to fetch customers");
    }
}
async listAllCarOwners(): Promise<ICarOwner[]> {
    try {
        console.log("reached222");
        return await this._adminRepository.getAllOwners();
    } catch (error) {
        console.error("Error in listAllCustomers:", error);
        throw new Error("Failed to fetch customers");
    }
}

// async updateCustomerStatus(customerId: string, status: -2 | -1 | 0 | 1 | 2): Promise<ICustomer | null> {
//     if (![-2, -1, 0, 1, 2].includes(status)) {
//         throw new Error("Invalid status. Use -2, -1, 0, 1, or 2.");
//     }
//     return await this._adminRepository.updateCustomerStatus(customerId, status);
// }

// async verifyCustomer(customerId: string, verificationType: "document" | "full"): Promise<ICustomer | null> {
//     return await this._adminRepository.verifyCustomer(customerId, verificationType);
// }

// async updateOwnerStatus(customerId: string, status: -2 | -1 | 0 | 1 | 2): Promise<ICarOwner | null> {
//     if (![-2, -1, 0, 1, 2].includes(status)) {
//         throw new Error("Invalid status. Use -2, -1, 0, 1, or 2.");
//     }
//     return await this._adminRepository.updateOwnerStatus(customerId, status);
// }

// async verifyOwner(customerId: string, verificationType: "document" | "full"): Promise<ICustomer | null> {
//     return await this._adminRepository.verifyOwner(customerId, verificationType);
// }





//   async updateCustomerStatus(userId: string, newStatus: number): Promise<ICustomer|null> {
    
//     const user = await this._adminRepository.findCustomerById(userId);
//     if (!user) throw new Error("User not found");

    
//     let updateData: Partial<ICustomer> = { previousStatus: user.status, status: newStatus };


//     if (newStatus === 1) {
//       updateData.idVerified = true;
//     }
       
       

    
//     if (newStatus === 3 && user.previousStatus !== null) {
//       updateData.status = user.previousStatus;
//       updateData.previousStatus = null; // Clear previous status after restoring
//     }


//     return await this._adminRepository.updateCustomerStatus(userId, updateData);
//   }



    // console.log("Processing status update:", customerId, newStatus);

    // const user = await this._adminRepository.findCustomerById(customerId);
    // if (!user) throw new Error("User not found");

    // let updateData: Partial<ICustomer> = { status: newStatus };

    // // ✅ Blocking (-2): Store the last valid status (-1 to 2), but not if already blocked
    // if (newStatus === -2 && user.status !== -2 && user.status >= -1 && user.status <= 2) {
    //     updateData.previousStatus = user.status; // Store the last valid state before blocking
    // }

    // // ✅ Unblocking (3): Restore only valid previous statuses (-1 to 2)
    // if (newStatus === 3) {
    //     if (user.previousStatus !== null && user.previousStatus >= -1 && user.previousStatus <= 2) {
    //         updateData.status = user.previousStatus; // Restore stored status
    //         updateData.previousStatus = null; // Clear previousStatus
    //     } else {
    //         updateData.status = 0; // Default to "Not Verified" if no valid previousStatus exists
    //         updateData.previousStatus = null;
    //     }
    // }

    // // ✅ Verification Updates: Ensure proper verification handling
    // if (newStatus === 1) {
    //     updateData.idVerified = true;
    // }
    // if (newStatus === 2) {
    //     updateData.isVerified = true;
    // }
    async updateCustomerStatus(customerId: string, newStatus: number): Promise<ICustomer | null> {
        console.log("Processing status update:", customerId, newStatus);
    
        const user = await this._adminRepository.findCustomerById(customerId);
        if (!user) throw new Error("User not found");
    
        let updateData: Partial<ICustomer> = { status: newStatus };
    
        // ✅ Blocking (-2): Store the last valid status (-1 to 2), but not if already blocked
        if (newStatus === -2 && user.status !== -2 && user.status >= -1 && user.status <= 2) {
            updateData.previousStatus = user.status; // Store the last valid state before blocking
        }
    
        // ✅ Unblocking (3): Restore only valid previous statuses (-1 to 2)
        if (newStatus === 3) {
            if (user.previousStatus !== null && user.previousStatus >= -1 && user.previousStatus <= 2) {
                updateData.status = user.previousStatus; // Restore stored status
                updateData.previousStatus = null; // Clear previousStatus
            } else {
                updateData.status = 0; // Default to "Not Verified" if no valid previousStatus exists
                updateData.previousStatus = null;
            }
        }
    
        // ✅ Verification Updates: Ensure proper verification handling
        if (newStatus === 1) {
            updateData.idVerified = true;
        }
        if (newStatus === 2) {
            updateData.isVerified = true;
        }
    
        return await this._adminRepository.updateCustomerStatus(customerId, updateData);
    
}


async updateOwnerStatus(ownerId: string, newStatus: number): Promise<ICarOwner | null> {
    console.log("Processing status update:", ownerId, newStatus);

    const user = await this._adminRepository.findCarOwnerById(ownerId);
    if (!user) throw new Error("User not found");

    let updateData: Partial<ICarOwner> = { status: newStatus };

    // ✅ Blocking (-2): Store the last valid status (-1 to 2), but not if already blocked
    if (newStatus === -2 && user.status !== -2 && user.status >= -1 && user.status <= 2) {
        updateData.previousStatus = user.status; // Store the last valid state before blocking
    }

    // ✅ Unblocking (3): Restore only valid previous statuses (-1 to 2)
    if (newStatus === 3) {
        if (user.previousStatus !== null && user.previousStatus >= -1 && user.previousStatus <= 2) {
            updateData.status = user.previousStatus; // Restore stored status
            updateData.previousStatus = null; // Clear previousStatus
        } else {
            updateData.status = 0; // Default to "Not Verified" if no valid previousStatus exists
            updateData.previousStatus = null;
        }
    }

    // ✅ Verification Updates: Ensure proper verification handling
    if (newStatus === 1) {
        updateData.idVerified = true;
    }
    if (newStatus === 2) {
        updateData.isVerified = true;
    }

    return await this._adminRepository.updateOwnerStatus(ownerId, updateData);

}





// async updateCustomerStatus(customerId: string, newStatus: number): Promise<ICustomer | null> {
//     console.log("Processing status update:", customerId, newStatus);

//     const user = await this._adminRepository.findCustomerById(customerId);
//     if (!user) throw new Error("User not found");

//     let updateData: Partial<ICustomer> = { previousStatus: user.status, status: newStatus };

//     if (newStatus === 1) {
//         updateData.idVerified = true;
//     }

//     if (newStatus === 2) {
//         updateData.isVerified = true;
//     }

//     if (newStatus === -2) { 
//         if(user.previousStatus!==3){ // 🚨 Block user (store previous status)
//         updateData.previousStatus = user.status;}
//     }

//     if (newStatus === 3 && user.previousStatus !== null) {  // ✅ Unblock (restore previous status)
//         updateData.status = user.previousStatus;
//         updateData.previousStatus = null;
//     }

//     return await this._adminRepository.updateCustomerStatus(customerId, updateData);
// }



// async updateCustomerStatus(customerId: string, newStatus: number): Promise<ICustomer | null> {

//     console.log("hello3333")
//     console.log(customerId)
//     const user = await this._adminRepository.findCustomerById(customerId);
//     console.log(user)
//     if (!user) throw new Error("User not found");
  
//     let  clearStatus=user.status;
//     let updateData: Partial<ICustomer> = { previousStatus: user.status, status: newStatus };
  
//     if (newStatus === 1) {
//       updateData.idVerified = true;
//     }
  
//     if (newStatus === 2) {
//         updateData.isVerified = true;
//       }
//     if (newStatus === 3 && user.previousStatus !== null) {
//       updateData.status = user.previousStatus;
//       updateData.previousStatus = null;
//     }

//     return await this._adminRepository.updateCustomerStatus(customerId, updateData);
//   }
  

//   async updateOwnerStatus(ownerId: string, newStatus: number): Promise<ICarOwner | null> {
//     const user = await this._adminRepository.findCarOwnerById(ownerId);
//     if (!user) throw new Error("User not found");
  
//     let updateData: Partial<ICarOwner> = { previousStatus: user.status, status: newStatus };
  
//     if (newStatus === 1) {
//       updateData.idVerified = true;
//     }
//     if (newStatus === 2) {
//         updateData.isVerified = true;
//       }
  
//     if (newStatus === 3 && user.previousStatus !== null) {
//       updateData.status = user.previousStatus;
//       updateData.previousStatus = null;
//     }
//     return await this._adminRepository.updateOwnerStatus(ownerId, updateData);
//   }




}







export default AdminService