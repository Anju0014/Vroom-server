import {ICustomer} from '../../../models/customer/customerModel';
import { IBooking } from '../../../models/booking/bookingModel';
import { IWallet } from '../../../models/wallet/walletModel';
import { BookingUserData } from '../../../types/bookingData';


interface ICustomerDashBoardRepository{
    
    findBookingsByUserId (userId: string,page:number,limit:number):Promise<any>
    bookingsByUserCount(userId:string): Promise<number>
    findBookingById(bookingId: string): Promise<IBooking | null>;
  saveBooking(bookingData:IBooking): Promise<IBooking>;
 logWalletTransaction(
    userId: string,
    type: string, // 'refund', 'payment', 'cancellation'
    amount: number,
    description: string
  ): Promise<void>
  createWallet(userId: string): Promise<IWallet|null> 
  findWalletByUserId(userId: string): Promise<IWallet | null> 
  saveWallet(wallet: IWallet): Promise<IWallet|null> 
}


export default ICustomerDashBoardRepository


