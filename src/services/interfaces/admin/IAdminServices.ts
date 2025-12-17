// import IAdminRepository from '../../../repositories/interfaces/admin/IAdminRepository';
// import { IAdmin } from '../../../models/admin/adminModel';
// import { ICustomer } from '../../../models/customer/customerModel';
// import { ICarOwner } from '../../../models/carowner/carOwnerModel';
// import { ICar } from '../../../models/car/carModel';
// export interface IAdminService {
//   loginAdmin(
//     email: string,
//     password: string
//   ): Promise<{ admin: IAdmin | null; adminAccessToken: string; refreshToken: string }>;
//   logoutAdmin(refreshToken: string): Promise<void>;
//   listAllCustomers(
//     page: number,
//     limit: number,
//     search: string
//   ): Promise<{ customers: ICustomer[]; total: number }>;
//   listAllCarOwners(
//     page: number,
//     limit: number,
//     search: string
//   ): Promise<{ carOwners: ICarOwner[]; total: number }>;
//   updateCustomerBlockStatus(customerId: string, newStatus: number): Promise<ICustomer | null>;
// }

import { AdminLoginResponseDTO } from '../../../dtos/admin/adminLogin.response.dto';
import { CustomerListResponseDTO } from '../../../dtos/customer/customerList.response.dto';
import { CarOwnerListResponseDTO } from '../../../dtos/carOwner/carOwnerList.response.dto';
import { CustomerListItemDTO } from '../../../dtos/customer/customerList.response.dto';

export interface IAdminService {
  loginAdmin(
    email: string,
    password: string
  ): Promise<AdminLoginResponseDTO>;

  logoutAdmin(refreshToken: string): Promise<void>;

  listAllCustomers(
    page: number,
    limit: number,
    search: string
  ): Promise<CustomerListResponseDTO>;

  listAllCarOwners(
    page: number,
    limit: number,
    search: string
  ): Promise<CarOwnerListResponseDTO>;

  updateCustomerBlockStatus(
    customerId: string,
    blockStatus: number
  ): Promise<CustomerListItemDTO>;
}
