import { Car } from '../models/Car';

export const carMapper = {
  toDTO(car: Car): any {
    return {
      id: car._id,
      carName: car.carName,
      brand: car.brand,
      year: car.year,
      fuelType: car.fuelType,
      carType: car.carType,
      rcBookNo: car.rcBookNo,
      expectedWage: car.expectedWage,
      location: car.location,
      images: car.images,
      videos: car.videos,
      // Exclude sensitive fields
    };
  },
};