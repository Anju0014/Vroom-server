import ICarOwnerCarsRepository from '../../../repositories/interfaces/carOwner/ICarOwnerCarsRepository';
import { ICarOwnerCarsService } from '../../interfaces/carOwner/ICarOwnerCarsServices';
import { Car, ICar } from '../../../models/car/carModel';
import { IBooking } from '../../../models/booking/bookingModel';
import mongoose from 'mongoose';
import { INotificationService } from '../../interfaces/notification/INotificationServices';
import IAdminRepository from '../../../repositories/interfaces/admin/IAdminRepository';
import { NotificationTemplates } from '../../../templates/notificationTemplates';
import ICarOwnerRepository from '../../../repositories/interfaces/carOwner/ICarOwnerRepository';
import logger from '../../../utils/logger';

class CarOwnerCarsService implements ICarOwnerCarsService {
  private _ownersCarRepository: ICarOwnerCarsRepository;
  private _ownerRepository:ICarOwnerRepository;
   private readonly _adminRepository: IAdminRepository;
  private readonly _notificationService: INotificationService;

  constructor(carRepository: ICarOwnerCarsRepository, ownerRepository:ICarOwnerRepository,adminRepository:IAdminRepository, notificationService:INotificationService) {
    this._ownersCarRepository = carRepository;
    this._ownerRepository=ownerRepository;
    this._adminRepository=adminRepository;
    this._notificationService= notificationService;
  }

  async registerNewCar(carDetails: Partial<ICar>, ownerId: string): Promise<ICar> {
    logger.info('registering car for owner', ownerId);
    if (!ownerId) throw new Error('Owner ID is required');
      const owner=await this._ownerRepository.findById(ownerId)
       if (!owner ){
        throw new Error("Owner not found");
      }

    const carData: Partial<ICar> = {
      ...carDetails,
      owner: new mongoose.Types.ObjectId(ownerId), // Ensure ObjectId is used
      images: carDetails.images && Array.isArray(carDetails.images) ? carDetails.images : [],
      videos: carDetails.videos && Array.isArray(carDetails.videos) ? carDetails.videos : [],
    };

    const createdCar = await this._ownersCarRepository.createCar(carData);
    // return await this._ownersCarRepository.createCar(carData);

     const admin=await this._adminRepository.findPrimaryAdmin()
         if (!admin) {
        throw new Error("Admin not found");
      }
  
     const notifications=await this._notificationService.create(
     NotificationTemplates.newCarForApproval(
      admin._id.toString(),
      createdCar.id.toString(),
      owner.fullName || "Car Owner"
    )
  );

  return createdCar;

  }

  async getCarsByOwner(ownerId: string, page: number, limit: number): Promise<ICar[]> {
    return await this._ownersCarRepository.getCarsByOwner(ownerId, page, limit);
  }

  async getCarsCount(ownerId: string): Promise<number> {
    return this._ownersCarRepository.getCarsCount(ownerId);
  }

  async updateCarAvailability(
    carId: string,
    ownerId: string,
    unavailableDates: string[]
  ): Promise<ICar> {
    const car = await this._ownersCarRepository.updateAvailability(
      carId,
      ownerId,
      unavailableDates
    );
    if (!car) {
      throw new Error(`Car with ID ${carId} not found or not owned by user`);
    }
    return car;
  }

  async getBookingsByCarId(carId: string, ownerId: string): Promise<IBooking[]> {
    return await this._ownersCarRepository.findByCarId(carId, ownerId);
  }

  async deleteCar(carId: string): Promise<ICar> {
    const deletedCar = await this._ownersCarRepository.deleteCarById(carId);
    if (!deletedCar) {
      throw new Error('Car not found or already deleted');
    }
    return deletedCar;
  }

  async updateCar(carId: string, updatedData: Partial<ICar>): Promise<ICar> {
    const existingCar = await this._ownersCarRepository.findCarById(carId);
    if (!existingCar || existingCar.isDeleted) {
      throw new Error('Car not found or has been deleted.');
    }

    const updatedCar = await this._ownersCarRepository.updateCarById(carId, updatedData);
    if (!updatedCar) {
      throw new Error('Failed to update the car.');
    }

    return updatedCar;
  }

  async getActiveBookingForCar(carId: string) {
    logger.info("booking for car with id",carId);
    const booking = await this._ownersCarRepository.findActiveBookingByCarId(carId);
    return booking;
  }
}
export default CarOwnerCarsService;
