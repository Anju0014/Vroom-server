import { CustomerWalletDTO } from '../dtos/transactions/customerWallet.dto';
import { TransactionDTO } from '../dtos/transactions/transaction.dto';

export class CustomerWalletMapper {
  static toDTO(wallet: any): CustomerWalletDTO {
    return {
      balance: wallet.balance,
      transactions: wallet.transactions.map(
        (txn: any): TransactionDTO => ({
          type: txn.type,
          amount: txn.amount,
          date: txn.date,
          description: txn.description,
        })
      ),
    };
  }
}
