import { ICar } from '../../models/car/carModel';

export interface CarDTO {
  id: string;
  carName: string;
  brand: string;
  year?: number;
  fuelType?: string;
  carType?: string;
  rcBookNo?: string;
  expectedWage: number;
  available?: boolean;
  location: {
    address: string;
    landmark?: string;
    coordinates: [number, number];
  };
  images: string[];
  videos: string[];
  rcBookProof: string;
  insuranceProof: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
