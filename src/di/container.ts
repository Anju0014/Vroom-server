import { Container } from 'inversify';
import { IAuthRepository } from '../features/auth/repositories/interfaces/IAuthRepository';
import { AuthRepository } from '../features/auth/repositories/implementation/AuthRepository';
import { IAuthService } from '../features/auth/services/interfaces/IAuthService';
import { AuthService } from '../features/auth/services/implementation/AuthService';
import { ICarOwnerAuthController } from '../features/auth/controllers/interfaces/ICarOwnerAuthController';
import { CarOwnerAuthController } from '../features/auth/controllers/implementation/CarOwnerAuthController';
import { ICustomerAuthController } from '../features/auth/controllers/interfaces/ICustomerAuthController';
import { CustomerAuthController } from '../features/auth/controllers/implementation/CustomerAuthController';
import { IAdminAuthController } from '../features/auth/controllers/interfaces/IAdminAuthController';
import { AdminAuthController } from '../features/auth/controllers/implementation/AdminAuthController';

const container = new Container();
container.bind<IAuthRepository>('IAuthRepository').to(AuthRepository);
container.bind<IAuthService>('IAuthService').to(AuthService);
container.bind<ICarOwnerAuthController>('CarOwnerAuthController').to(CarOwnerAuthController);
container.bind<ICustomerAuthController>('CustomerAuthController').to(CustomerAuthController);
container.bind<IAdminAuthController>('AdminAuthController').to(AdminAuthController);
export default container;