import { CarOwnerDTO } from './carOwner.dto';

export interface CarOwnerListResponseDTO {
  carOwners: CarOwnerDTO[];
  total: number;
}
