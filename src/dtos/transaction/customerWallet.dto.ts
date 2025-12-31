import { TransactionDTO } from './transaction.dto';

export interface CustomerWalletDTO {
  balance: number;
  transactions: TransactionDTO[];
}
