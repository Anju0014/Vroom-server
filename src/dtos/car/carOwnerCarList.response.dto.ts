import { CarOwnerCarDTO } from './carOwnerCar.dto';

export interface CarOwnerCarListResponseDTO {
  cars: CarOwnerCarDTO[];
  total: number;
}
