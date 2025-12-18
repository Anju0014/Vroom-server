
// import { ICar } from '../models/car/carModel';
// import { RegisterCarResponseDTO } from '../dtos/car/registerCar.response.dto';
// import { CarOwnerCarDTO } from '../dtos/car/carOwnerCar.dto';

// export class CarMapper {
//   static toRegisterResponse(car: ICar): RegisterCarResponseDTO {
//     return {
//       id: car._id.toString(),
//       carName: car.carName,
//       verifyStatus: car.verifyStatus,
//       blockStatus: car.blockStatus,
//       createdAt: car.createdAt,
//     };
//   }

//   static toCarOwnerDTO(car: ICar): CarOwnerCarDTO {
//     return {
//       id: car._id.toString(),
//       carName: car.carName,
//       expectedWage: car.expectedWage,
//       verifyStatus: car.verifyStatus,
//       blockStatus: car.blockStatus,
//       images: car.images,
//       createdAt: car.createdAt,
//     };
//   }
// }
import { ICar } from '../models/car/carModel';
import { IBooking } from '../models/booking/bookingModel';
import { RegisterCarResponseDTO } from '../dtos/car/registerCar.response.dto';
import { CarOwnerCarDTO } from '../dtos/car/carOwnerCar.dto';
import { CarDTO } from '../dtos/car/car.dto';
import { CarBookingDTO } from '../dtos/car/carBooking.dto';

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
      expectedWage: car.expectedWage,
      verifyStatus: car.verifyStatus,
      blockStatus: car.blockStatus,
      images: car.images,
      createdAt: car.createdAt,
    };
  }


  static toCarDTO(car: ICar): CarDTO {
    return {
      id: car._id.toString(),
      carName: car.carName,
      brand: car.brand,
      year: car.year ? Number(car.year) : undefined,
      fuelType: car.fuelType,
      carType: car.carType,
      rcBookNo: car.rcBookNo,
      expectedWage: car.expectedWage,
      available: car.available ?? true,
      location: {
        address: car.location.address,
        landmark: car.location.landmark,
        coordinates: car.location.coordinates.coordinates as [number, number],
      },
      images: car.images || [],
      videos: car.videos || [],
      rcBookProof: car.rcBookProof||'',
      insuranceProof: car.insuranceProof||'',
      ownerId: car.owner.toString(),
      createdAt: car.createdAt,
      updatedAt: car.updatedAt,
    };
  }

  static toCarDTOs(cars: ICar[]): CarDTO[] {
    return cars.map(this.toCarDTO);
  }

  // --- Booking mappings ---
  static toCarBookingDTO(booking: IBooking): CarBookingDTO {
    return {
      id: booking._id.toString(),
      carId: booking.carId.toString(),
      customerId: booking.userId.toString(),
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalPrice: booking.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  static toCarBookingDTOs(bookings: IBooking[]): CarBookingDTO[] {
    return bookings.map(this.toCarBookingDTO);
  }
}
