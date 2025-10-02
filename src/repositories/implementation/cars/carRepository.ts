import { ICar } from '../../../models/car/carModel';
import { ICarOwner } from '../../../models/carowner/carOwnerModel';
import { IBooking } from '../../../models/booking/bookingModel';
import ICarRepository from '../../interfaces/cars/ICarRepository';
import { BaseRepository } from '../../base/BaseRepository';
import { Car } from '../../../models/car/carModel';
import { CarOwner } from '../../../models/carowner/carOwnerModel';
import { Booking } from '../../../models/booking/bookingModel';
import { Types } from 'mongoose';
import { startOfDay, endOfDay } from 'date-fns';
import { buildSearchQuery } from "../../../utils/queryUtils";

export class CarRepository extends BaseRepository<ICar> implements ICarRepository {
  constructor() {
    super(Car);
  }

  async createCar(carData: Partial<ICar>): Promise<ICar> {
    try {
      if (!carData.owner || !carData.carName || !carData.brand || !carData.expectedWage || !carData.location) {
        throw new Error('Missing required car fields');
      }
      return await Car.create(carData);
    } catch (error) {
      console.error('Error in createCar:', error);
      throw new Error(`Failed to create car: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCarsByOwner(ownerId: string, page: number, limit: number): Promise<ICar[]> {
    try {
      if (!Types.ObjectId.isValid(ownerId)) throw new Error('Invalid owner ID');
      if (page < 1 || limit < 1 || limit > 100) throw new Error('Invalid page or limit');
      return await Car.find({ owner: ownerId, isDeleted: false })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
    } catch (error) {
      console.error('Error in getCarsByOwner:', error);
      throw new Error(`Failed to fetch cars for owner ${ownerId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCarsCountByOwner(filters: { ownerId: string }): Promise<number> {
    try {
      if (!Types.ObjectId.isValid(filters.ownerId)) throw new Error('Invalid owner ID');
      return await Car.countDocuments({ owner: filters.ownerId, isDeleted: false }).exec();
    } catch (error) {
      console.error('Error in getCarsCountByOwner:', error);
      throw new Error(`Failed to count cars for owner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
    try {
      const query: any = { isDeleted: false, verifyStatus: 1 };
      if (filters.search) query.carName = { $regex: filters.search, $options: 'i' };
      if (filters.minPrice) query.expectedWage = { ...query.expectedWage, $gte: filters.minPrice };
      if (filters.maxPrice !== Infinity) query.expectedWage = { ...query.expectedWage, $lte: filters.maxPrice };
      if (filters.carType) query.carType = filters.carType;
      if (filters.location) {
        query.$or = [
          { 'location.address': { $regex: filters.location, $options: 'i' } },
          { 'location.landmark': { $regex: filters.location, $options: 'i' } },
        ];
      }
      if (filters.latitude && filters.longitude) {
        query['location.coordinates'] = {
          $nearSphere: {
            $geometry: { type: 'Point', coordinates: [filters.longitude, filters.latitude] },
            $maxDistance: 50 * 1000, // Default max distance: 50km
          },
        };
      }
      if (filters.startDate && filters.endDate) {
        const start = startOfDay(new Date(filters.startDate));
        const end = endOfDay(new Date(filters.endDate));
        if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new Error('Invalid date format');
        const overlappingBookings = await Booking.find({
          status: { $in: ['confirmed', 'pending'] },
          startDate: { $lt: end },
          endDate: { $gt: start },
        }).select('carId');
        const bookedCarIds = overlappingBookings.map((b) => b.carId);
        if (bookedCarIds.length > 0) query._id = { $nin: bookedCarIds };
      }
      return await Car.countDocuments(query).exec();
    } catch (error) {
      console.error('Error in getCarsCount:', error);
      throw new Error(`Failed to count cars: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateAvailability(carId: string, ownerId: string, unavailableDates: string[]): Promise<ICar | null> {
    try {
      if (!Types.ObjectId.isValid(carId) || !Types.ObjectId.isValid(ownerId)) {
        throw new Error('Invalid car ID or owner ID');
      }
      if (!Array.isArray(unavailableDates)) throw new Error('unavailableDates must be an array');
      return await Car.findOneAndUpdate(
        { _id: carId, owner: ownerId, isDeleted: false },
        { unavailableDates },
        { new: true }
      ).exec();
    } catch (error) {
      console.error('Error in updateAvailability:', error);
      throw new Error(`Failed to update availability for car ${carId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteCarById(carId: string): Promise<ICar | null> {
    try {
      if (!Types.ObjectId.isValid(carId)) throw new Error('Invalid car ID');
      return await Car.findByIdAndUpdate(carId, { isDeleted: true }, { new: true }).exec();
    } catch (error) {
      console.error('Error in deleteCarById:', error);
      throw new Error(`Failed to delete car ${carId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateCarById(carId: string, updatedData: Partial<ICar>): Promise<ICar | null> {
    try {
      if (!Types.ObjectId.isValid(carId)) throw new Error('Invalid car ID');
      return await Car.findByIdAndUpdate(carId, updatedData, { new: true }).exec();
    } catch (error) {
      console.error('Error in updateCarById:', error);
      throw new Error(`Failed to update car ${carId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findCarById(carId: string): Promise<ICar | null> {
    try {
      if (!Types.ObjectId.isValid(carId)) throw new Error('Invalid car ID');
      return await Car.findById(carId).exec();
    } catch (error) {
      console.error('Error in findCarById:', error);
      throw new Error(`Failed to find car ${carId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findNearbyCars(lat: number, lng: number, maxDistance: number): Promise<ICar[]> {
    try {
      if (isNaN(lat) || isNaN(lng) || isNaN(maxDistance) || maxDistance <= 0) {
        throw new Error('Invalid coordinates or maxDistance');
      }
      return await Car.find({
        verifyStatus: 1,
        isDeleted: false,
        available: true,
        'location.coordinates': {
          $nearSphere: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: maxDistance * 1000, // km to meters
          },
        },
      }).exec();
    } catch (error) {
      console.error('Error in findNearbyCars:', error);
      throw new Error(`Failed to find nearby cars: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findFeaturedCars(): Promise<ICar[]> {
    try {
      return await Car.find({
        verifyStatus: 1,
        isDeleted: false,
        available: true,
      }).exec();
    } catch (error) {
      console.error('Error in findFeaturedCars:', error);
      throw new Error(`Failed to find featured cars: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findBookedDates(carId: string): Promise<{ start: Date; end: Date }[]> {
    try {
      if (!Types.ObjectId.isValid(carId)) throw new Error('Invalid car ID');
      const bookings = await Booking.find({
        carId: new Types.ObjectId(carId),
        status: { $in: ['confirmed', 'pending'] },
      }).select('startDate endDate').exec();
      return bookings.map((booking) => ({
        start: startOfDay(booking.startDate),
        end: endOfDay(booking.endDate),
      }));
    } catch (error) {
      console.error('Error in findBookedDates:', error);
      throw new Error(`Failed to find booked dates for car ${carId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
    try {
      if (page < 1 || limit < 1 || limit > 100) throw new Error('Invalid page or limit');
      const query: any = { isDeleted: false, verifyStatus: 1 };

      if (filters.search) query.carName = { $regex: filters.search, $options: 'i' };
      if (filters.minPrice) query.expectedWage = { ...query.expectedWage, $gte: filters.minPrice };
      if (filters.maxPrice !== Infinity) query.expectedWage = { ...query.expectedWage, $lte: filters.maxPrice };
      if (filters.carType) query.carType = filters.carType;
      if (filters.location) {
        query.$or = [
          { 'location.address': { $regex: filters.location, $options: 'i' } },
          { 'location.landmark': { $regex: filters.location, $options: 'i' } },
        ];
      }
      if (filters.latitude && filters.longitude) {
        query['location.coordinates'] = {
          $nearSphere: {
            $geometry: { type: 'Point', coordinates: [filters.longitude, filters.latitude] },
            $maxDistance: 50 * 1000, // Default max distance: 50km
          },
        };
      }
      if (filters.startDate && filters.endDate) {
        const start = startOfDay(new Date(filters.startDate));
        const end = endOfDay(new Date(filters.endDate));
        if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new Error('Invalid date format');
        const overlappingBookings = await Booking.find({
          status: { $in: ['confirmed', 'pending'] },
          startDate: { $lt: end },
          endDate: { $gt: start },
        }).select('carId');
        const bookedCarIds = overlappingBookings.map((b) => b.carId);
        if (bookedCarIds.length > 0) query._id = { $nin: bookedCarIds };
      }

      return await Car.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec();
    } catch (error) {
      console.error('Error in getAllCars:', error);
      throw new Error(`Failed to fetch cars: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllCarsForVerify(page: number, limit: number, search: string): Promise<{ cars: ICar[]; total: number }> {
    try {
      if (page < 1 || limit < 1 || limit > 100) throw new Error('Invalid page or limit');
      const filter = { verifyStatus: 0, isDeleted: false, ...buildSearchQuery(search, ['carName', 'brand', 'model']) };
      const cars = await Car.find(filter)
        .populate('owner', 'fullName email phoneNumber')
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      const total = await Car.countDocuments(filter).exec();
      return { cars, total };
    } catch (error) {
      console.error('Error in getAllCarsForVerify:', error);
      throw new Error(`Failed to fetch cars for verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllVerifiedCars(page: number, limit: number, search: string): Promise<{ cars: ICar[]; total: number }> {
    try {
      if (page < 1 || limit < 1 || limit > 100) throw new Error('Invalid page or limit');
      const filter = {
        verifyStatus: 1,
        isDeleted: false,
        available: true,
        ...buildSearchQuery(search, ['carName', 'brand', 'model']),
      };
      const cars = await Car.find(filter)
        .populate('owner', 'fullName email phoneNumber')
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      const total = await Car.countDocuments(filter).exec();
      return { cars, total };
    } catch (error) {
      console.error('Error in getAllVerifiedCars:', error);
      throw new Error(`Failed to fetch verified cars: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findCarOwnerById(ownerId: string): Promise<ICarOwner | null> {
    try {
      if (!Types.ObjectId.isValid(ownerId)) throw new Error('Invalid owner ID');
      return await CarOwner.findById(ownerId).select('fullName email phoneNumber').exec();
    } catch (error) {
      console.error('Error in findCarOwnerById:', error);
      throw new Error(`Failed to find car owner ${ownerId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByCarId(carId: string, ownerId: string): Promise<IBooking[]> {
    try {
      if (!Types.ObjectId.isValid(carId) || !Types.ObjectId.isValid(ownerId)) {
        throw new Error('Invalid car ID or owner ID');
      }
      return await Booking.find({
        carId: new Types.ObjectId(carId),
      }).exec();
    } catch (error) {
      console.error('Error in findByCarId:', error);
      throw new Error(`Failed to fetch bookings for car ${carId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}