import { ICustomer } from '../models/customer/customerModel';
import { CustomerDTO } from '../dtos/customer/customer.dto';
import { CustomerAuthDTO } from '../dtos/customer/customerAuth.dto';
import { CustomerBasicDTO } from '../dtos/customer/customerBasic.dto';
import { CustomerUpdateDTO } from '../dtos/customer/customerUpdate.dto';

export class CustomerMapper {
  static toDTO(customer: ICustomer): CustomerDTO {
    return {
      id: customer._id.toString(),
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      isVerified: customer.isVerified,
      processStatus: customer.processStatus,
      verifyStatus: customer.verifyStatus,
      blockStatus: customer.blockStatus,
      idVerified: customer.idVerified,
      profileImage: customer.profileImage,
      createdAt: customer.createdAt,
    };
  }

  static toDTOList(customers: ICustomer[]): CustomerDTO[] {
    return customers.map((c) => this.toDTO(c));
  }

  static toAuthDTO(customer: ICustomer): CustomerAuthDTO {
    return {
      id: customer._id.toString(),
      fullName: customer.fullName,
      email: customer.email,
      role: customer.role,
      profileImage: customer.profileImage,
    };
  }

  static toBasicDTO(customer: ICustomer): CustomerBasicDTO {
    return {
      email: customer.email,
    };
  }

  static toUpdateDTO(customer: ICustomer): CustomerUpdateDTO {
    return {
      id: customer._id.toString(),
      fullName: customer.fullName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      profileImage: customer.profileImage,
    };
  }
}
