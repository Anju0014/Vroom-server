import { CarDTO } from './car.dto';

export interface CarListResponseDTO {
  cars: CarDTO[];
  total: number;
}
