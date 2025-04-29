import { Schema, model, Types } from 'mongoose';



interface IWallet {
  userId: Types.ObjectId;        
  balance: number;                
  transactions: ITransaction[];   
  createdAt?: Date;               
  updatedAt?: Date;               
}


interface ITransaction {
  type: 'refund' | 'payment' | 'cancellation' | 'other';
  amount: number;      
  date: Date;          
  description?: string; 
}

const WalletSchema = new Schema<IWallet>(
    {
      userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Customer', 
        required: true, 
        unique: true 
      },
      balance: { 
        type: Number, 
        required: true, 
        default: 0 
      },
      transactions: [
        {
          type: { 
            type: String, // 'refund', 'payment', 'cancellation', 'other'
            required: true 
          },
          amount: { 
            type: Number, 
            required: true 
          },
          date: { 
            type: Date, 
            default: Date.now 
          },
          description: { 
            type: String 
          },
        },
      ],
    },
    { timestamps: true }
  );
  
  // Creating the Wallet model
  const Wallet = model<IWallet>('Wallet', WalletSchema);
  
  export  {Wallet,IWallet};