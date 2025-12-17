import { ICustomer } from '../models/customer/customerModel';
import { CustomerDTO } from '../dtos/customer/customer.dto';

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
    return customers.map(this.toDTO);
  }
}
