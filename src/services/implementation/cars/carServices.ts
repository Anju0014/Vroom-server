
// import ICarOwnerCarsRepository from "../../../repositories/interfaces/carOwner/ICarOwnerCarsRepository";
// import { ICarOwnerCarsService} from "../../interfaces/carOwner/ICarOwnerCarsServices";
// import { ICar } from "../../../models/car/carModel";
// import { IBooking} from "../../../models/booking/bookingModel"
// import mongoose from "mongoose";

// class CarOwnerCarsService implements ICarOwnerCarsService {

//     private _ownersCarRepository : ICarOwnerCarsRepository;

//     constructor(carRepository:ICarOwnerCarsRepository){
//         this._ownersCarRepository=carRepository
//     }

//     async registerNewCar(carDetails: Partial<ICar>, ownerId: string): Promise<ICar> {
//         console.log("registering car for owner",ownerId)
//           if (!ownerId) throw new Error("Owner ID is required");
        
//           const carData: Partial<ICar> = {
//             ...carDetails,
//             owner: new mongoose.Types.ObjectId(ownerId), // Ensure ObjectId is used
//             images: carDetails.images && Array.isArray(carDetails.images) ? carDetails.images : [],
//             videos: carDetails.videos && Array.isArray(carDetails.videos) ? carDetails.videos : [],
//           };
        
//           return await this._ownersCarRepository.createCar(carData);
//     }
//         async getCarsByOwner(ownerId: string, page: number, limit: number): Promise<ICar[]> {
//           return await this._ownersCarRepository.getCarsByOwner(ownerId,page,limit);
//         }

//         async getCarsCountByOwner(ownerId: string): Promise<number> {
//     return this._ownersCarRepository.getCarsCount(ownerId);
//   }

   
//   async updateCarAvailability(carId: string, ownerId: string, unavailableDates: string[]): Promise<ICar> {
//     const car = await this._ownersCarRepository.updateAvailability(carId, ownerId, unavailableDates);
//     if (!car) {
//       throw new Error(`Car with ID ${carId} not found or not owned by user`);
//     }
//     return car;
//   }

  

//         async deleteCar(carId: string): Promise<ICar> {
//             const deletedCar = await this._ownersCarRepository.deleteCarById(carId);
//             if (!deletedCar) {
//               throw new Error("Car not found or already deleted");
//             }
//             return deletedCar;
//           }


//           async updateCar(carId: string, updatedData: Partial<ICar>): Promise<ICar> {
//             const existingCar = await this._ownersCarRepository.findCarById(carId);
//             if (!existingCar || existingCar.isDeleted) {
//               throw new Error("Car not found or has been deleted.");
//             }
          
//             const updatedCar = await this._ownersCarRepository.updateCarById(carId, updatedData);
//             if (!updatedCar) {
//               throw new Error("Failed to update the car.");
//             }
          
//             return updatedCar;
//           }
          

       
          
    
          
// }
// export default CarOwnerCarsService



// import ICustomerCarAndBookingRepository from "../../../repositories/interfaces/customer/ICustomerCarAndBookingRepository";
// import { ICustomerCarAndBookingService } from "../../interfaces/customer/ICustomerCarAndBookingServices";
// import { ICar } from "../../../models/car/carModel";
// import { BookingData,UpdateTrackingProps } from "../../../types/bookingData";
// import mongoose from "mongoose";
// import generateTrackingToken from "../../../utils/trackingIDGenerator";
// import { getIO } from "../../../sockets/socket";
// import { endOfDay } from "date-fns";

// class CustomerCarAndBookingService implements ICustomerCarAndBookingService {

//     private _customerCarRepository : ICustomerCarAndBookingRepository;

//     constructor(customerCarRepository:ICustomerCarAndBookingRepository){
//         this._customerCarRepository=customerCarRepository
//     }

//     async getNearbyCars(lat: number, lng: number, maxDistance: number): Promise<ICar[]> {
//         return this._customerCarRepository.findNearbyCars(lat, lng, maxDistance);
//       }
    
//       async getFeaturedCars(): Promise<ICar[]> {
//         return this._customerCarRepository.findFeaturedCars();
//       }
    
//       async getCarDetail(carId: string): Promise<ICar | null> {
//         return this._customerCarRepository.findCarById(carId);
//       }
    
//        async getBookedDateRanges(carId: string): Promise<{ start: Date; end: Date }[]> {
//         return this._customerCarRepository.findBookedDates(carId);
//       }
    

//   async getAllCars(page: number, limit: number, filters: {
//     search?: string;
//     minPrice?: number;
//     maxPrice?: number;
//     carType?:string;
//     location?: string;
//     startDate:string, 
//     endDate:string
//     // latitude?: number;
//     // longitude?: number;
//   }):Promise<ICar[]>  {
//     return this._customerCarRepository.getAllCars(page, limit, filters);
//   }

//   async getCarsCount(filters: {
//     search?: string;
//     minPrice?: number;
//     maxPrice?: number;
//     carType?:string;
//     location?:string;
//     startDate:string,
//      endDate:string
//     // latitude?: number;
//     // longitude?: number;
//   }):Promise<number>  {
//     return this._customerCarRepository.getCarsCount(filters);
//   }

    
          
// }
// export default CustomerCarAndBookingService


// import IAdminOwnerRepository from "../../../repositories/interfaces/admin/IAdminOwnerRepository";
// import { IAdminOwnerService } from "../../interfaces/admin/IAdminOwnerServices";
// import { IAdmin } from "../../../models/admin/adminModel";
// import JwtUtils from "../../../utils/jwtUtils";
// import { ICarOwner } from "../../../models/carowner/carOwnerModel";
// import { sendEmail } from "../../../utils/emailconfirm";
// import { ICar } from "../../../models/car/carModel";
// import { IBooking } from "../../../models/booking/bookingModel";
// import { carVerificationApprovedTemplate, carVerificationRejectedTemplate, verificationApprovedTemplate,verificationRejectedTemplate } from "../../../templates/emailTemplates";


// class AdminOwnerService implements IAdminOwnerService {

//     private _adminOwnerRepository : IAdminOwnerRepository;

//     constructor(adminOwnerRepository:IAdminOwnerRepository){
//         this._adminOwnerRepository=adminOwnerRepository
//     }



// async listAllCarsforVerify(page: number,limit: number,search: string): Promise<{cars:ICar[], total: number}> {
//     try {
//         console.log("reached222");
//         return await this._adminOwnerRepository.getAllCarsforVerify(page,limit,search);
//     } catch (error) {
//         console.error("Error in listAllCustomers:", error);
//         throw new Error("Failed to fetch customers");
//     }
// }


// async listAllVerifiedCars(page: number,limit: number,search: string): Promise<{cars:ICar[], total: number}> {
//     try {
//         console.log("reached222");
//         return await this._adminOwnerRepository.getAllVerifiedCars(page,limit,search);
//     } catch (error) {
//         console.error("Error in listAllCustomers:", error);
//         throw new Error("Failed to fetch customers");
//     }
// }



// async updateCarBlockStatus(carId: string, newStatus: number): Promise<ICar | null> {
//     console.log("Processing status update:", carId, newStatus)
//     const car= await this._adminOwnerRepository.findCarById(carId);
//     if (!car) throw new Error("Car not found");
//     let updateData: Partial<ICar> = { blockStatus: newStatus };
//     return await this._adminOwnerRepository.updateCarStatus(carId, updateData);
// }

// async updateCarVerifyStatus(carId: string, verifyDetails: Partial<ICar>): Promise<ICar | null> {
//     const { verifyStatus, rejectionReason } = verifyDetails;

//     if (verifyStatus === -1 && !rejectionReason) {
//       throw new Error("Reason is required when rejecting");
//     }

//     const car = await this._adminOwnerRepository.findCarById(carId);
//     if (!car) {
//       throw new Error("Car not found");
//     }

//     const updatedCar = await this._adminOwnerRepository.updateCarStatus(carId, verifyDetails);
//     if (!updatedCar) {
//       throw new Error("Error updating car status");
//     }

//     if (verifyStatus === -1) {
//       const updatedUser = await this._adminOwnerRepository.findCarOwnerById(String(updatedCar.owner));
//       if (!updatedUser) {
//         throw new Error("Car owner not found");
//       }
      
//       const emailContent = carVerificationRejectedTemplate(updatedUser.fullName,updatedCar.carName, rejectionReason);
//       await sendEmail({ to: updatedUser.email, ...emailContent });

 
      
//     }

//     return updatedCar;
//   }

// }


// export default AdminOwnerService
 



import { ICar } from '../../../models/car/carModel';
import ICarRepository from '../../../repositories/interfaces/ICarRepository'; // Unified repository interface
import { ICarService } from '../../interfaces/cars/ICarService';
import mongoose from 'mongoose';
import { sendEmail } from '../../../utils/emailconfirm';
import { carVerificationApprovedTemplate, carVerificationRejectedTemplate, verificationApprovedTemplate } from '../../../templates/emailTemplates';

export class CarService implements ICarService {
  private _carRepository: ICarRepository;

  constructor(carRepository: ICarRepository) {
    this._carRepository = carRepository;
  }

  async registerNewCar(carDetails: Partial<ICar>, ownerId: string): Promise<ICar> {
    if (!ownerId) throw new Error('Owner ID is required');
    if (!carDetails.carName || !carDetails.brand || !carDetails.expectedWage || !carDetails.location) {
      throw new Error('Missing required car fields');
    }

    const carData: Partial<ICar> = {
      ...carDetails,
      owner: new mongoose.Types.ObjectId(ownerId),
      images: carDetails.images && Array.isArray(carDetails.images) ? carDetails.images : [],
      videos: carDetails.videos && Array.isArray(carDetails.videos) ? carDetails.videos : [],
       // Default to unblocked
    };

    return await this._carRepository.createCar(carData);
  }

  async getCarsByOwner(ownerId: string, page: number, limit: number): Promise<ICar[]> {
    if (!ownerId) throw new Error('Owner ID is required');
    if (page < 1 || limit < 1 || limit > 100) throw new Error('Invalid page or limit');
    return await this._carRepository.getCarsByOwner(ownerId, page, limit);
  }

  async getCarsCountByOwner(ownerId: string): Promise<number> {
    if (!ownerId) throw new Error('Owner ID is required');
    return await this._carRepository.getCarsCountByOwner({ ownerId });
  }

  async updateCarAvailability(carId: string, ownerId: string, unavailableDates: string[]): Promise<ICar> {
    if (!carId || !ownerId) throw new Error('Car ID and Owner ID are required');
    if (!Array.isArray(unavailableDates)) throw new Error('unavailableDates must be an array of strings');
    const car = await this._carRepository.updateAvailability(carId, ownerId, unavailableDates);
    if (!car) throw new Error(`Car with ID ${carId} not found or not owned by user`);
    return car;
  }

  async deleteCar(carId: string): Promise<ICar> {
    if (!carId) throw new Error('Car ID is required');
    const deletedCar = await this._carRepository.deleteCarById(carId);
    if (!deletedCar) throw new Error('Car not found or already deleted');
    return deletedCar;
  }

  async updateCar(carId: string, updatedData: Partial<ICar>): Promise<ICar> {
    if (!carId) throw new Error('Car ID is required');
    const existingCar = await this._carRepository.findCarById(carId);
    if (!existingCar || existingCar.isDeleted) throw new Error('Car not found or has been deleted');

    const updatedCar = await this._carRepository.updateCarById(carId, updatedData);
    if (!updatedCar) throw new Error('Failed to update the car');
    return updatedCar;
  }

  async getNearbyCars(lat: number, lng: number, maxDistance: number): Promise<ICar[]> {
    if (!lat || !lng) throw new Error('Coordinates are required');
    if (isNaN(maxDistance) || maxDistance <= 0) throw new Error('Invalid maxDistance');
    return await this._carRepository.findNearbyCars(lat, lng, maxDistance);
  }

  async getFeaturedCars(): Promise<ICar[]> {
    return await this._carRepository.findFeaturedCars();
  }

  async getCarDetail(carId: string): Promise<ICar | null> {
    if (!carId) throw new Error('Car ID is required');
    return await this._carRepository.findCarById(carId);
  }

  async getBookedDateRanges(carId: string): Promise<{ start: Date; end: Date }[]> {
    if (!carId) throw new Error('Car ID is required');
    return await this._carRepository.findBookedDates(carId);
  }

  async getAllCars(
    page: number,
    limit: number,
    filters: {
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      carType?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      latitude?: number;
      longitude?: number;
    }
  ): Promise<ICar[]> {
    if (page < 1 || limit < 1 || limit > 100) throw new Error('Invalid page or limit');
    return await this._carRepository.getAllCars(page, limit, filters);
  }

  async getCarsCount(filters: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    carType?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<number> {
    return await this._carRepository.getCarsCount(filters);
  }

  async listAllCarsForVerify(page: number, limit: number, search: string): Promise<{ cars: ICar[]; total: number }> {
    if (page < 1 || limit < 1 || limit > 100) throw new Error('Invalid page or limit');
    try {
      return await this._carRepository.getAllCarsForVerify(page, limit, search);
    } catch (error) {
      console.error('Error in listAllCarsForVerify:', error);
      throw new Error('Failed to fetch cars for verification');
    }
  }

  async listAllVerifiedCars(page: number, limit: number, search: string): Promise<{ cars: ICar[]; total: number }> {
    if (page < 1 || limit < 1 || limit > 100) throw new Error('Invalid page or limit');
    try {
      return await this._carRepository.getAllVerifiedCars(page, limit, search);
    } catch (error) {
      console.error('Error in listAllVerifiedCars:', error);
      throw new Error('Failed to fetch verified cars');
    }
  }

  async updateCarBlockStatus(carId: string, newStatus: number): Promise<ICar | null> {
    if (!carId) throw new Error('Car ID is required');
    const car = await this._carRepository.findCarById(carId);
    if (!car) throw new Error('Car not found');
    const updateData: Partial<ICar> = { blockStatus: newStatus };
    return await this._carRepository.updateCarById(carId, updateData);
  }

  async updateCarVerifyStatus(carId: string, verifyDetails: Partial<ICar>): Promise<ICar | null> {
    if (!carId) throw new Error('Car ID is required');
    const { verifyStatus, rejectionReason } = verifyDetails;
    if (verifyStatus === -1 && !rejectionReason) throw new Error('Reason is required when rejecting');

    const car = await this._carRepository.findCarById(carId);
    if (!car) throw new Error('Car not found');

    const updatedCar = await this._carRepository.updateCarStatus(carId, verifyDetails);
    if (!updatedCar) throw new Error('Error updating car status');

    if (verifyStatus !== undefined) {
      const owner = await this._carRepository.findCarOwnerById(String(updatedCar.owner));
      if (!owner) throw new Error('Car owner not found');

      const emailContent =
        verifyStatus === -1
          ? carVerificationRejectedTemplate(owner.fullName, updatedCar.carName, rejectionReason)
          : carVerificationApprovedTemplate(owner.fullName,updatedCar.carName);

      await sendEmail({ to: owner.email, ...emailContent });
    }

    return updatedCar;
  }
}

export default CarService;