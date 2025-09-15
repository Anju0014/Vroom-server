import {Admin,IAdmin} from "../../../models/admin/adminModel"
import IAdminRepository from "../../interfaces/admin/IAdminRepository";
import { BaseRepository } from "../../base/BaseRepository";
import {Customer,ICustomer} from "../../../models/customer/customerModel"
import {CarOwner,ICarOwner} from "../../../models/carowner/carOwnerModel"
import { buildSearchQuery } from "../../../utils/queryUtils";
import { Car, ICar } from "../../../models/car/carModel";


interface PaginationResult<T> {
  data: T[];
  total: number;
}
class AdminRepository extends BaseRepository<IAdmin> implements IAdminRepository {

     constructor(){
        super(Admin);
     }
    async findUserByEmail(email:string): Promise<IAdmin |null>{
        return await Admin.findOne({email})
    }
    async create(user: Partial<IAdmin>): Promise<IAdmin> {
        return await Admin.create(user);
    }
    async updatePassword(adminId:string,password:string):Promise<void>{
        await Admin.findByIdAndUpdate(adminId,{password})
    }
    async findUserByRefreshToken(refreshToken: string): Promise<IAdmin | null> {
        console.log(refreshToken);

        const admin=await Admin.findOne({ refreshToken });
        console.log(admin);
        return admin
      }


    async updateRefreshToken(adminId:string,refreshToken:string): Promise<void>{
        console.log("gyubb",refreshToken)
        const admin=await Admin.findByIdAndUpdate(adminId,{refreshToken})
        console.log("//////",admin)
        
    }

    async clearRefreshToken(adminId: string): Promise<void> {
        await Admin.updateOne({ _id: adminId }, { $set: { refreshToken: null } });
      }

    //   async getAllCustomers(page: number,limit: number,search: string):Promise<{ customers: ICustomer[]; total: number }>{
    //     try {
    //         console.log("reached ,,,,6");
    //         const customers = await Customer.find({}, "-password -refreshToken",);
    //         console.log("Customers fetched:", customers);
    //         if (!customers || !Array.isArray(customers)) {  
    //             console.error(" No customers found or invalid format.");
    //             return [];
    //         }
    //         return customers;
    //     } catch (error) {
    //         console.error("Error in getAllCustomers:", error);
    //         throw new Error("Database query failed");
    //     }
    // }
    
    // async getAllOwners(page: number,limit: number,search: string):Promise<{ carOwners: ICarOwner[]; total: number }>{
    //     try {
    //         console.log("reached ,,,,6");
    //         const carowners = await CarOwner.find({}, "-password -refreshToken");
    //         console.log("Customers fetched:", carowners);
    //         if (!carowners || !Array.isArray(carowners)) {  
    //             console.error("No customers found or invalid format.");
    //             return [];
    //         }
    //         return carowners;
    //     } catch (error) {
    //         console.error("Error in getAllOwners:", error);
    //         throw new Error("Database query failed");
    //     }
    // }
    async getAllCustomers(
  page: number,
  limit: number,
  search: string
): Promise<{ customers: ICustomer[]; total: number }> {
  try {
    const filter ={ processStatus:2, verifyStatus: 1, ... buildSearchQuery(search, ["fullName", "email", "phoneNumber"])};

    const customers = await Customer.find(filter, "-password -refreshToken")
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Customer.countDocuments(filter);

    return { customers, total };
  } catch (error) {
    console.error("Error in getAllCustomers:", error);
    throw new Error("Database query failed");
  }
}

async getAllOwners(
  page: number,
  limit: number,
  search: string
): Promise<{ carOwners: ICarOwner[]; total: number }> {
  try {
    const filter = {processStatus:2, verifyStatus:1,...buildSearchQuery(search, ["fullName", "email", "phoneNumber"])};

    const carOwners = await CarOwner.find(filter, "-password -refreshToken")
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await CarOwner.countDocuments(filter);

    return { carOwners, total };
  } catch (error) {
    console.error("Error in getAllOwners:", error);
    throw new Error("Database query failed");
  }
}


   
    async findCustomerById (customerId:string): Promise<ICustomer | null>{
        console.log("kiki")
        console.log(customerId)
        let response=await Customer.findById(customerId);
        console.log(response);
        return response
    }
    
    async updateCustomerStatus(customerId:string, updateData: Partial<ICustomer>) :Promise<ICustomer | null> {
        return await Customer.findByIdAndUpdate(customerId, updateData, { new: true });
    };

  
}
export default AdminRepository


     
    // async getAllOwnerVerify(): Promise<ICarOwner[]> {
    //     try {
    //         console.log("reached ,,,,6");
    //         const carowners = await CarOwner.find({processStatus:2,verifyStatus:0}, "-password -refreshToken");
    //         console.log("Customers fetched:", carowners);
    //         if (!carowners || !Array.isArray(carowners)) {  
    //             console.error("No customers found or invalid format.");
    //             return [];
    //         }
    //         return carowners;
    //     } catch (error) {
    //         console.error("Error in getAllOwners:", error);
    //         throw new Error("Database query failed");
    //     }
    // }








    // async getAllCarsVerify(): Promise<ICar[]> {
    //     try {
    //         console.log("reached ,,,,6");
    //         const cars = await Car.find();
    //         console.log("Customers fetched:", cars);
    //         if (!cars || !Array.isArray(cars)) {  
    //             console.error("No customers found or invalid format.");
    //             return [];
    //         }
    //         return cars;
    //     } catch (error) {
    //         console.error("Error in getAllOwners:", error);
    //         throw new Error("Database query failed");
    //     }
    // }


    // //   async getAllCustomers(): Promise<ICustomer[]> {
    // //     console.log("reached ,,,,6")
    // //     return await Customer.find({}, "-password -refreshToken");
    // // }

    // // async updateCustomerStatus(customerId: string, status: -2 | -1 | 0 | 1 | 2): Promise<ICustomer | null> {
    // //     return await Customer.findByIdAndUpdate(customerId, { status }, { new: true });
    // // }

    // async verifyCustomer(customerId: string, verificationType: "document" | "full"): Promise<ICustomer | null> {
    //     let updateData: Partial<ICustomer> = {};

    //     if (verificationType === "document") {
    //         updateData.status = 1;
    //     } else if (verificationType === "full") {
    //         updateData.status = 2;
    //         updateData.isVerified = true;
    //     } else {
    //         throw new Error("Invalid verification type. Use 'document' or 'full'.");
    //     }

    //     return await Customer.findByIdAndUpdate(customerId, updateData, { new: true });
    // }

    // // async updateOwnerStatus(ownerId: string, status: -2 | -1 | 0 | 1 | 2): Promise<ICustomer | null> {
    // //     return await CarOwner.findByIdAndUpdate(ownerId, { status }, { new: true });
    // // }

    // async verifyOwner(customerId: string, verificationType: "document" | "full"): Promise<ICustomer | null> {
    //     let updateData: Partial<ICarOwner> = {};

    //     if (verificationType === "document") {
    //         updateData.status = 1;
    //     } else if (verificationType === "full") {
    //         updateData.status = 2;
    //         updateData.isVerified = true;
    //     } else {
    //         throw new Error("Invalid verification type. Use 'document' or 'full'.");
    //     }

    //     return await Customer.findByIdAndUpdate(customerId, updateData, { new: true });
    // }


      // async findCarOwnerById (ownerId:string): Promise<ICarOwner | null>{
    //     console.log("kiki")
    //     console.log(ownerId)
    //     let response=await CarOwner.findById(ownerId);
    //     console.log(response);
    //     return response
    // }
    
    // async updateOwnerStatus(ownerId:string, updateData: Partial<ICarOwner>) :Promise<ICarOwner | null> {
    //     return await CarOwner.findByIdAndUpdate(ownerId, updateData, { new: true });
    // };


    // async updateCarStatus(carId:string, updateData: Partial<ICar>) :Promise<ICar| null> {
    //     return await Car.findByIdAndUpdate(carId, updateData, { new: true });
    // };


    // async findCarById(carId: string): Promise<ICar | null> {
    //     return Car.findById(carId);
    //   }
   