export interface TransactionDTO {
  type: string;
  amount: number;
  date: Date;
  description?: string;
}
