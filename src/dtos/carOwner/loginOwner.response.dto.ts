import { CarOwnerPublicDTO } from './carOwnerPublic.dto';

export interface LoginCarOwnerResponseDTO {
  accessToken: string;
  user: CarOwnerPublicDTO;
}
