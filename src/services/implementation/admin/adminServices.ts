import IAdminRepository from '../../../repositories/interfaces/admin/IAdminRepository';
import { IAdminService } from '../../interfaces/admin/IAdminServices';
import { IAdmin } from '../../../models/admin/adminModel';
import PasswordUtils from '../../../utils/passwordUtils';
import JwtUtils from '../../../utils/jwtUtils';
import { ICustomer } from '../../../models/customer/customerModel';
import { ICarOwner } from '../../../models/carowner/carOwnerModel';



import { AdminLoginResponseDTO } from '../../../dtos/admin/adminLogin.response.dto';
import { CustomerListResponseDTO } from '../../../dtos/customer/customerList.response.dto';
import { CarOwnerListResponseDTO } from '../../../dtos/carOwner/carOwnerList.response.dto';
// import { CustomerDTO }from '../../../dtos/customer/customerList.response.dto';
import { AdminMapper } from '../../../mappers/admin.mapper';
import { CustomerMapper } from '../../../mappers/customer.mapper';
import { CarOwnerMapper } from '../../../mappers/carOwner.mapper';
import { CustomerDTO } from '../../../dtos/customer/customer.dto';
import logger from '../../../utils/logger';


class AdminService implements IAdminService {
  private _adminRepository: IAdminRepository;

  constructor(adminRepository: IAdminRepository) {
    this._adminRepository = adminRepository;
  }
  async loginAdmin(
    email: string,
    password: string
  ): Promise<AdminLoginResponseDTO> {
    logger.info(`checking login things`);
    const admin = await this._adminRepository.findUserByEmail(email);
    logger.info(admin);
    if (!admin) {
      logger.warn('not correct user');
      throw new Error('Invalid Credentials');
    }
    const passwordTrue = await PasswordUtils.comparePassword(password, admin.password);
    if (!passwordTrue) {
      logger.warn('not correct password');
      throw new Error('Invalid Credentials');
    }
    const adminAccessToken = JwtUtils.generateAccessToken({
      id: admin._id,
      email: admin.email,
      role: 'admin',
    });
    const newRefreshToken = JwtUtils.generateRefreshToken({ id: admin._id });

    await this._adminRepository.updateRefreshToken(admin._id.toString(), newRefreshToken);
    const admin2 = await this._adminRepository.findUserByRefreshToken(newRefreshToken);
    logger.info(admin2);
    logger.info(newRefreshToken);
     return AdminMapper.toLoginResponse(admin, adminAccessToken, newRefreshToken);
    // return { adminAccessToken, refreshToken: newRefreshToken, admin };
  }

  async logoutAdmin(refreshToken: string): Promise<void> {
    logger.info(refreshToken);
    const admin = await this._adminRepository.findUserByRefreshToken(refreshToken);
   logger.info(admin);
    if (!admin) {
      logger.info(': no admin error');
      throw new Error('User not found');
    }
    await this._adminRepository.clearRefreshToken(admin._id.toString());
  }

  async listAllCustomers(
    page: number,
    limit: number,
    search: string
  ): Promise<CustomerListResponseDTO>{
    try {
      
    const { customers, total } =
    await this._adminRepository.getAllCustomers(page, limit, search);

  return {
    customers: CustomerMapper.toDTOList(customers),
    total,
  };
      // return await this._adminRepository.getAllCustomers(page, limit, search);
    } catch (error) {
      logger.error('Error in listAllCustomers:', error);
      throw new Error('Failed to fetch customers');
    }
  }
  async listAllCarOwners(
    page: number,
    limit: number,
    search: string
  ): Promise<CarOwnerListResponseDTO> {
    try {
     
        const { carOwners, total } =
      await this._adminRepository.getAllOwners(page, limit, search);
return {
  carOwners: CarOwnerMapper.toDTOList(carOwners),
  total,
};
      // return await this._adminRepository.getAllOwners(page, limit, search);
    } catch (error) {
      logger.error('Error in listAllCustomers:', error);
      throw new Error('Failed to fetch customers');
    }
  }

  async updateCustomerBlockStatus(
    customerId: string,
    newStatus: number
  ): Promise<CustomerDTO> {
    logger.info('Processing status update:', customerId, newStatus);
    // const user = await this._adminRepository.findCustomerById(customerId);
    // if (!user) throw new Error('User not found');
    // let updateData: Partial<ICustomer> = { blockStatus: newStatus };
    // return await this._adminRepository.updateCustomerStatus(customerId, updateData);
    const customer =
      await this._adminRepository.findCustomerById(customerId);

    if (!customer) {
      throw new Error('User not found');
    }
    let updateData: Partial<ICustomer> = { blockStatus: newStatus };

    const updatedCustomer =
      await this._adminRepository.updateCustomerStatus(customerId, updateData);

    if (!updatedCustomer) {
      throw new Error('Failed to update status');
    }

    
    return CustomerMapper.toDTO(updatedCustomer);
  }
}

export default AdminService;
