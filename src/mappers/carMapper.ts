// import { ICar } from '../models/car/carModel';
// import mongoose from 'mongoose';
// import { UserDTO } from './userMapper';

// export interface CarDTO {
//   id: string;
//   carName: string;
//   brand: string;
//   year?: number; 
//   fuelType?: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
//   carType?: 'Sedan' | 'SUV' | 'Hatchback' | 'VAN/MPV';
//   rcBookNo?: string;
//   expectedWage: number; 
//   rcBookProof?: string;
//   insuranceProof?: string;
//   location: {
//     address: string;
//     landmark: string;
//     coordinates: {
//       lat: number;
//       lng: number;
//     };
//   };
//   make?: string;
//   carModel?: string;
//   verifyStatus?: number;
//   blockStatus?: boolean; 
//   images: string[];
//   videos?: string[];
//   available?: boolean;
//   unavailableDates?: string[]; 
//   rejectionReason?: string;
//   ownerDetails?: {
//     id: string;
//     fullName: string;
//     email: string;
//     phoneNumber: string;
//   }; 
// }

// export const carMapper = {
//   toDTO(car: ICar & { _id: mongoose.Types.ObjectId }): CarDTO {
   
//     const validCarType = car.carType && ['Sedan', 'SUV', 'Hatchback', 'VAN/MPV'].includes(car.carType)
//       ? car.carType as 'Sedan' | 'SUV' | 'Hatchback' | 'VAN/MPV'
//       : undefined;

//     return {
//       id: car._id.toString(),
//       carName: String(car.carName), 
//       brand: String(car.brand), 
//       year: car.year ? parseInt(car.year, 10) : undefined, 
//       fuelType: car.fuelType,
//       carType: validCarType, 
//       rcBookNo: car.rcBookNo ? String(car.rcBookNo) : undefined, 
//       expectedWage: parseFloat(car.expectedWage), 
//       rcBookProof: car.rcBookProof ? String(car.rcBookProof) : undefined, 
//       insuranceProof: car.insuranceProof ? String(car.insuranceProof) : undefined, 
//       location: {
//         address: String(car.location.address), 
//         landmark: String(car.location.landmark), 
//         coordinates: car.location.coordinates?.coordinates
//           ? {
//               lat: car.location.coordinates.coordinates[1], // GeoJSON: [lng, lat]
//               lng: car.location.coordinates.coordinates[0],
//             }
//           : { lat: 0, lng: 0 }, 
//       },
//       make: car.make ? String(car.make) : undefined, 
//       carModel: car.carModel ? String(car.carModel) : undefined, 
//       verifyStatus: car.verifyStatus,
//       blockStatus: car.blockStatus === 1, 
//       images: car.images.map(String), 
//       videos: car.videos?.map(String) || [], 
//       available: car.available ?? true,
//       unavailableDates: car.unavailableDates?.map((date) => date.toISOString()) || [],
//       rejectionReason: car.rejectionReason ? String(car.rejectionReason) : undefined, 
//       ownerDetails: car.owner && typeof car.owner === 'object' && 'fullName' in car.owner
//         ? {
//             id: (car.owner as any)._id.toString(),
//             fullName: String((car.owner as any).fullName),
//             email: String((car.owner as any).email),
//             phoneNumber: String((car.owner as any).phoneNumber),
//           }
//         : undefined, // Compatible with UserDTO
//     };
//   },

// }

import { ICar } from '../models/car/carModel';
import mongoose from 'mongoose';
import { UserDTO } from './userMapper';

export interface CarDTO {
  id: string;
  carName: string;
  brand: string;
  year?: number; // Convert string to number for API
  fuelType?: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  carType?: 'Sedan' | 'SUV' | 'Hatchback' | 'VAN/MPV';
  rcBookNo?: string;
  expectedWage: number; // Convert string to number for API
  rcBookProof?: string;
  insuranceProof?: string;
  location: {
    address: string;
    landmark: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  make?: string;
  carModel?: string;
  verifyStatus?: number;
  blockStatus?: boolean; // Convert number (0/1) to boolean
  images: string[];
  videos?: string[];
  available?: boolean;
  unavailableDates?: string[]; // ISO strings
  rejectionReason?: string;
  ownerDetails?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  }; // Subset of UserDTO
}

export const carMapper = {
  toDTO(car: ICar): CarDTO {
    // Cast _id to mongoose.Types.ObjectId
    const id = (car._id as mongoose.Types.ObjectId).toString();

    // Validate and cast carType to match CarDTO
    const validCarType = car.carType && ['Sedan', 'SUV', 'Hatchback', 'VAN/MPV'].includes(car.carType)
      ? car.carType as 'Sedan' | 'SUV' | 'Hatchback' | 'VAN/MPV'
      : undefined;

    return {
      id,
      carName: String(car.carName), // Cast String to string
      brand: String(car.brand), // Cast String to string
      year: car.year ? parseInt(car.year, 10) : undefined, // Convert to number
      fuelType: car.fuelType,
      carType: validCarType,
      rcBookNo: car.rcBookNo ? String(car.rcBookNo) : undefined, // Cast String to string
      expectedWage: parseFloat(car.expectedWage), // Convert to number
      rcBookProof: car.rcBookProof ? String(car.rcBookProof) : undefined, // Cast String to string
      insuranceProof: car.insuranceProof ? String(car.insuranceProof) : undefined, // Cast String to string
      location: {
        address: String(car.location.address), // Cast String to string
        landmark: String(car.location.landmark), // Cast String to string
        coordinates: car.location.coordinates?.coordinates
          ? {
              lat: car.location.coordinates.coordinates[1], // GeoJSON: [lng, lat]
              lng: car.location.coordinates.coordinates[0],
            }
          : { lat: 0, lng: 0 }, // Fallback for missing coordinates
      },
      make: car.make ? String(car.make) : undefined, // Cast String to string
      carModel: car.carModel ? String(car.carModel) : undefined, // Cast String to string
      verifyStatus: car.verifyStatus,
      blockStatus: car.blockStatus === 1, // Convert number to boolean
      images: car.images.map(String), // Ensure string array
      videos: car.videos?.map(String) || [], // Ensure string array
      available: car.available ?? true,
      unavailableDates: car.unavailableDates?.map((date) => date.toISOString()) || [],
      rejectionReason: car.rejectionReason ? String(car.rejectionReason) : undefined, // Cast String to string
      ownerDetails: car.owner && typeof car.owner === 'object' && 'fullName' in car.owner
        ? {
            id: (car.owner as any)._id.toString(),
            fullName: String((car.owner as any).fullName),
            email: String((car.owner as any).email),
            phoneNumber: String((car.owner as any).phoneNumber),
          }
        : undefined, // Compatible with UserDTO
    };
  },

  toEntity(dto: Partial<CarDTO>): Partial<ICar> {
    return {
      _id: dto.id ? new mongoose.Types.ObjectId(dto.id) : undefined,
      carName: dto.carName,
      brand: dto.brand,
      year: dto.year ? String(dto.year) : undefined, // Convert number to string
      fuelType: dto.fuelType,
      carType: dto.carType,
      rcBookNo: dto.rcBookNo,
      expectedWage: dto.expectedWage ? String(dto.expectedWage) : undefined, // Convert number to string
      rcBookProof: dto.rcBookProof,
      insuranceProof: dto.insuranceProof,
      location: dto.location
        ? {
            address: dto.location.address,
            landmark: dto.location.landmark,
            coordinates: {
              type: 'Point',
              coordinates: [dto.location.coordinates.lng, dto.location.coordinates.lat], // [lng, lat]
            },
          }
        : undefined,
      make: dto.make,
      carModel: dto.carModel,
      verifyStatus: dto.verifyStatus,
      blockStatus: dto.blockStatus ? 1 : 0, // Convert boolean to number
      images: dto.images,
      videos: dto.videos,
      available: dto.available,
      unavailableDates: dto.unavailableDates?.map((date) => new Date(date)) || [],
      rejectionReason: dto.rejectionReason,
      owner: dto.ownerDetails?.id ? new mongoose.Types.ObjectId(dto.ownerDetails.id) : undefined,
    };
  },
};