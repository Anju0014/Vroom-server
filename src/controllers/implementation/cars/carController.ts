

import { Request, Response } from 'express';
import { CustomRequest } from '../../../middlewares/authMiddleWare';
import { ICarService } from '../../../services/interfaces/cars/ICarServices';
import { StatusCode } from '../../../constants/statusCode';
import { MESSAGES } from '../../../constants/message';
import { carMapper } from '../../../mappers/carMapper';
import { ICar } from '../../../models/car/carModel';

export class CarController {
  constructor(private carService: ICarService) {}

  async getAllCarsForVerify(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role !== 'admin') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      if (page < 1 || limit < 1 || limit > 100) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.INVALID_PAGE_OR_LIMIT,
        });
        return;
      }
      const { cars, total } = await this.carService.listAllCarsForVerify(page, limit, search);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.CARS_FETCHED || 'Cars for verification fetched successfully',
        data: cars.map(carMapper.toDTO),
        total,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getAllVerifiedCars(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role !== 'admin') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      if (page < 1 || limit < 1 || limit > 100) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.INVALID_PAGE_OR_LIMIT,
        });
        return;
      }
      const { cars, total } = await this.carService.listAllVerifiedCars(page, limit, search);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.CARS_FETCHED || 'Verified cars fetched successfully',
        data: cars.map(carMapper.toDTO),
        total,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateCarVerifyStatus(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role !== 'admin') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const { carId } = req.params;
      const { status, reason } = req.body;
      if (!carId || status === undefined) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      const verifyDetails = status === -1 ? { verifyStatus: status, rejectionReason: reason } : { verifyStatus: status };
      const updatedCar = await this.carService.updateCarVerifyStatus(carId, verifyDetails);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || 'Car verification status updated successfully',
        data: carMapper.toDTO(updatedCar),
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateCarBlockStatus(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role!== 'admin') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const { carId } = req.params;
      const { status } = req.body;
      if (!carId || status === undefined) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      const updatedCar = await this.carService.updateCarBlockStatus(carId, status);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || 'Car block status updated successfully',
        data: carMapper.toDTO(updatedCar),
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async uploadCar(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role !== 'carOwner') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const { carName, brand, year, fuelType, carType, rcBookNo, expectedWage, location, images, videos, rcBookProof, insuranceProof } = req.body;
      const ownerId = req.userId;
      if (!ownerId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.NO_OWNER_ID_FOUND,
        });
        return;
      }
      if (!carName || !brand || !expectedWage || !location || !insuranceProof || !rcBookProof || !images || (Array.isArray(images) && images.length === 0)) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      const geoLocation: ICar['location'] = {
        address: location.address,
        landmark: location.landmark,
        coordinates: {
          type: 'Point',
          coordinates: [location.coordinates.lng, location.coordinates.lat] as [number, number],
        },
      };
      const carData: Partial<ICar> = {
        carName,
        brand,
        year,
        fuelType,
        carType,
        rcBookNo,
        expectedWage,
        rcBookProof,
        insuranceProof,
        location: geoLocation,
        images: Array.isArray(images) ? images : [images],
        videos: videos && Array.isArray(videos) ? videos : [],
      };
      const newCar = await this.carService.registerNewCar(carData, ownerId);
      res.status(StatusCode.CREATED).json({
        success: true,
        message: MESSAGES.SUCCESS.CAR_UPLOADED || 'Car uploaded successfully',
        data: carMapper.toDTO(newCar),
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getCarList(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role !== 'carOwner') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const ownerId = req.userId;
      if (!ownerId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.NO_OWNER_ID_FOUND,
        });
        return;
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9;
      if (page < 1 || limit < 1 || limit > 100) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.INVALID_PAGE_OR_LIMIT,
        });
        return;
      }
      const cars = await this.carService.getCarsByOwner(ownerId, page, limit);
      const total = await this.carService.getCarsCountByOwner(ownerId);
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Car list fetched successfully',
        data: cars.map(carMapper.toDTO),
        total,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateCarAvailability(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role !== 'carOwner') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const ownerId = req.userId;
      const carId = req.params.id;
      if (!ownerId || !carId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      const { unavailableDates } = req.body;
      if (!Array.isArray(unavailableDates)) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'unavailableDates must be an array of strings',
        });
        return;
      }
      const car = await this.carService.updateCarAvailability(carId, ownerId, unavailableDates);
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Availability updated successfully',
        data: carMapper.toDTO(car),
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async deleteCar(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role !== 'carOwner') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const carId = req.params.id;
      if (!carId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      const deletedCar = await this.carService.deleteCar(carId);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.CAR_DELETED || 'Car deleted successfully',
        data: carMapper.toDTO(deletedCar),
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateCar(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.userId || req.role !== 'carOwner') {
        res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const carId = req.params.id;
      const ownerId = req.userId;
      const { carName, brand, year, fuelType, rcBookNo, expectedWage,
         location, images, videos, available, carType, rcBookProof, insuranceProof } = req.body;
      if (!ownerId || !carId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      if (!carName || !brand || !expectedWage || !location || !images ||
         (Array.isArray(images) && images.length === 0)) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      const geoLocation: ICar['location'] = {
        address: location.address,
        landmark: location.landmark,
        coordinates: {
          type: 'Point',
          coordinates: [location.coordinates.lng, location.coordinates.lat] as [number, number],
        },
      };
      const updatedCarData: Partial<ICar> = {
        carName,
        brand,
        year,
        fuelType,
        rcBookNo,
        expectedWage,
        available,
        rcBookProof,
        insuranceProof,
        carType,
        location: geoLocation,
        images: Array.isArray(images) ? images : [images],
        videos: videos && Array.isArray(videos) ? videos : [],
      };
      const updatedCar = await this.carService.updateCar(carId, updatedCarData);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.CAR_UPDATED || 'Car updated successfully',
        data: carMapper.toDTO(updatedCar),
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getNearbyCars(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { lat, lng, maxDistance = "50" } = req.query;
      if (!lat || !lng) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_COORDINATES,
        });
        return;
      }
      const cars = await this.carService.getNearbyCars(
        parseFloat(lat as string),
        parseFloat(lng as string),
        parseFloat(maxDistance as string)
      );
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Nearby cars fetched successfully',
        data: cars.map(carMapper.toDTO),
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getFeaturedCars(req: CustomRequest, res: Response): Promise<void> {
    try {
      const cars = await this.carService.getFeaturedCars();
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Featured cars fetched successfully',
        data: cars.map(carMapper.toDTO),
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getAllCars(req: CustomRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9;
      const search = req.query.search as string;
      const minPrice = parseFloat(req.query.minPrice as string) || 0;
      const maxPrice = parseFloat(req.query.maxPrice as string) || Infinity;
      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      const carType = req.query.carType as string;
      const location = req.query.location as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      if (page < 1 || limit < 1 || limit > 100) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.INVALID_PAGE_OR_LIMIT,
        });
        return;
      }
      const filterOptions = { search, minPrice, maxPrice, carType, location, startDate, endDate};
      const cars = await this.carService.getAllCars(page, limit, filterOptions);
      const total = await this.carService.getCarsCount(filterOptions);
      res.status(StatusCode.OK).json({
        success: true,
        message: 'All cars fetched successfully',
        data: cars.map(carMapper.toDTO),
        total,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getCarDetail(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { carId } = req.params;
      if (!carId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_FIELDS,
        });
        return;
      }
      const car = await this.carService.getCarDetail(carId);
      if (!car) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.NOT_FOUND,
        });
        return;
      }
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Car detail fetched successfully',
        data: carMapper.toDTO(car),
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getBookedDatesCars(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { carId } = req.params;
      if (!carId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.MISSING_CAR_ID,
        });
        return;
      }
      const bookedRanges = await this.carService.getBookedDateRanges(carId);
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Booked dates fetched successfully',
        data: bookedRanges,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private handleError(res: Response, error: unknown, statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR): void {
    const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR.SERVER_ERROR;
    console.error('Error in CarController:', error); // Log for debugging
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
}

export default CarController;