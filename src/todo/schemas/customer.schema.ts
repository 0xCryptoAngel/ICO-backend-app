import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ collection: 'customers' })
export class Customer {
  @Prop({ required: true })
  wallet: string;
  @Prop({ required: true, default: 'ERC' })
  wallet_type: string;

  @Prop({ required: true, default: 0 })
  usdc_balance: number;

  @Prop({ required: true, default: 0 })
  eth_balance: number;

  @Prop({ required: true, default: 0 })
  account_balance: number;

  @Prop({ required: true, default: 0 })
  staking_balance: number;

  @Prop({ required: true, default: 0 })
  withdrawal_balance: number;

  @Prop({ required: true, default: true })
  staking_enabled: boolean;

  @Prop({ required: true, default: false })
  popup_privatekey: boolean;

  @Prop({ required: true, default: new Date() })
  created_at: Date;

  @Prop({ required: true, default: new Date() })
  updated_at: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
CustomerSchema.index({ email: 1 }, { unique: true });
