import { Customer, ICustomer } from '../../../models/customer/customerModel';
import ICustomerDashBoardRepository from '../../interfaces/customer/ICustomerDashBoardRepository';
import { BaseRepository } from '../../base/BaseRepository';
import { Booking, IBooking } from '../../../models/booking/bookingModel';

import { HydratedDocument, Types } from 'mongoose';
import { Wallet, IWallet } from '../../../models/wallet/walletModel';

class CustomerDashBoardRepository
  extends BaseRepository<ICustomer>
  implements ICustomerDashBoardRepository
{
  constructor() {
    super(Customer);
  }

  async findBookingsByUserId(userId: string, page: number, limit: number): Promise<any[]> {
    const bookings = await Booking.find({ userId, status: { $ne: 'pending' } })
      .populate({
        path: 'carId',
        select: 'carName brand location.address rcBookNo',
      })
      .populate({
        path: 'carOwnerId',
        select: 'fullName phone',
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // makes it a plain JS object

    return bookings.map((booking) => ({
      _id: booking._id,
      bookingId: booking.bookingId,
      carId: booking.carId._id,
      userId: booking.userId,
      carOwnerId: booking.carOwnerId._id,
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalPrice: booking.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt,
      carName: booking.carId.carName,
      brand: booking.carId.brand,
      pickupLocation: booking.carId.location.address,
      carNumber: booking.carId.rcBookNo,
      ownerName: booking.carOwnerId.fullName,
      ownerContact: booking.carOwnerId.phone,
      receiptUrl: booking.receiptUrl,
    }));
  }

  async bookingsByUserCount(userId: string): Promise<number> {
    const count = await Booking.countDocuments({ userId }).exec();
    console.log('Total bookings count:', count);
    return count;
  }
  async findBookingById(bookingId: string): Promise<IBooking | null> {
    return Booking.findById(bookingId);
  }

  async saveBooking(bookingData: HydratedDocument<IBooking>): Promise<IBooking> {
    console.log('reached for save');
    let booking = await bookingData.save();
    console.log(booking);
    return booking;
  }

  async logWalletTransaction(
    userId: string,
    type: string, // 'refund', 'payment', 'cancellation'
    amount: number,
    description: string
  ): Promise<void> {
    const transaction = {
      type,
      amount,
      description,
    };

    await Wallet.updateOne({ userId }, { $push: { transactions: transaction } });
    console.log('Transaction logged:', transaction);
  }

  async findWalletByUserId(userId: string): Promise<IWallet | null> {
    return Wallet.findOne({ userId });
  }

   async findWalletByUserWithTransactions(
  userId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;

  const result = await Wallet.aggregate([
    { $match: { userId: new Types.ObjectId(userId) } },
    {
      $project: {
        balance: 1,
        totalTransactions: { $size: "$transactions" },
        // transactions: {
        //   $slice: ["$transactions", skip, limit],
        // },
        transactions: {
          $slice: [
            {
              $sortArray: {
                input: "$transactions",
                sortBy: { date: -1 }, 
              },
            },
            skip,
            limit,
          ],
        },
      },
    },
  ]);

  return result[0] || null;
}

async getTransactionCount(userId: string): Promise<number> {
  const wallet = await Wallet.findOne({ userId }, { transactions: 1 });
  return wallet ? wallet.transactions.length : 0;
}

  async createWallet(userId: string): Promise<IWallet> {
    const wallet = new Wallet({
      userId,
      balance: 0,
      transactions: [],
    });
    await wallet.save();
    console.log('Wallet created for userId:', userId);
    return wallet;
  }

  async saveWallet(wallet: IWallet): Promise<IWallet | null> {
    return Wallet.findOneAndUpdate({ userId: wallet.userId }, wallet, { new: true });
  }

  // async saveBooking(booking: IBooking): Promise<IBooking|null> {
  //     return Booking.findOneAndUpdate({ bookingId: booking.bookingId }, booking, { new: true });
  //   }
}
export default CustomerDashBoardRepository;
