import { ICar } from '../models/car/carModel';
import { RegisterCarResponseDTO } from '../dto/car/register-car.response.dto';
import { CarOwnerCarDTO } from '../dto/car/car-owner-car.dto';

export class CarMapper {
  static toRegisterResponse(car: ICar): RegisterCarResponseDTO {
    return {
      id: car._id.toString(),
      carName: car.carName,
      verifyStatus: car.verifyStatus,
      blockStatus: car.blockStatus,
      createdAt: car.createdAt,
    };
  }

  static toCarOwnerDTO(car: ICar): CarOwnerCarDTO {
    return {
      id: car._id.toString(),
      carName: car.carName,
      pricePerDay: car.pricePerDay,
      verifyStatus: car.verifyStatus,
      blockStatus: car.blockStatus,
      images: car.images,
      createdAt: car.createdAt,
    };
  }
}
