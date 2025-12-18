import ICustomerDashBoardRepository from '../../../repositories/interfaces/customer/ICustomerDashBoardRepository';
import { ICustomerDashBoardService } from '../../interfaces/customer/ICustomerDashBoardServices';

import { stripe } from '../../../config/stripeConfig';
import { IBooking } from '../../../models/booking/bookingModel';
import logger from '../../../utils/logger';

class CustomerDashBoardService implements ICustomerDashBoardService {
  private _customerDashRepository: ICustomerDashBoardRepository;

  constructor(customerDashRepository: ICustomerDashBoardRepository) {
    this._customerDashRepository = customerDashRepository;
  }

  async getCustomerBookings(userId: string, page: number, limit: number): Promise<any[]> {
    return this._customerDashRepository.findBookingsByUserId(userId, page, limit);
  }

  async getCustomerBookingCount(userId: string): Promise<number> {
    return this._customerDashRepository.bookingsByUserCount(userId);
  }

  async cancelBooking(bookingId: string): Promise<IBooking> {
  
    const booking = await this._customerDashRepository.findBookingById(bookingId);

    if (!booking || booking.status !== 'confirmed') {
      throw new Error('Invalid or non-confirmed booking');
    }

    const totalAmount = booking.totalPrice;
    const cancellationFeeRate = 0.01;
    const cancellationFee = Math.round(totalAmount * cancellationFeeRate);
    const refundAmount = totalAmount - cancellationFee;

    if (booking.paymentIntentId) {
      const refund = await stripe.refunds.create({
        payment_intent: booking.paymentIntentId,
        amount: refundAmount * 100,
      });
      logger.info('Refund processed through Stripe:', refund.id);

      await this._customerDashRepository.logWalletTransaction(
        booking.userId.toString(),
        'refund',
        refundAmount,
        `Refund for booking cancellation via Stripe`
      );
    }

    let wallet = await this._customerDashRepository.findWalletByUserId(booking.userId.toString());

    if (!wallet) {
      logger.warn('Wallet not found. Creating a new wallet...');
      wallet = await this._customerDashRepository.createWallet(booking.userId.toString());
    }

    if (!wallet) {
      throw new Error('Failed to create wallet');
    }

    wallet.balance += refundAmount;
    await this._customerDashRepository.saveWallet(wallet);
    logger.info('Wallet updated with refund. New balance:', wallet.balance);

    await this._customerDashRepository.logWalletTransaction(
      booking.userId.toString(),
      'refund',
      refundAmount,
      `Refund added to wallet after cancellation`
    );

    // Mark the booking as cancelled
    booking.status = 'cancelled';
    booking.cancellationFee = cancellationFee;
    booking.refundedAmount = refundAmount;
    booking.cancelledAt = new Date();
    // await this._customerDashRepository.saveBooking(booking);

    const updatedBooking = await this._customerDashRepository.saveBooking(booking);
   logger.info('Booking cancelled and saved successfully.');
    return updatedBooking;
  }
}
export default CustomerDashBoardService;
