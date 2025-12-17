import { CustomerDTO } from './customer.dto';

export interface CustomerListResponseDTO {
  customers: CustomerDTO[];
  total: number;
}
