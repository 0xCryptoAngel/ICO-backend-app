import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WithdrawalDocument = Withdrawal & Document;

@Schema({ collection: 'withdrawals' })
export class Withdrawal {
  @Prop({ required: true, default: new Date() })
  created_at: Date;

  @Prop({ required: true })
  wallet: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: false })
  is_confirmed: boolean;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);
