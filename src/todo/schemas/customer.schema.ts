import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Document, Types } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ collection: 'customers' })
export class Customer {
  @Prop({ required: true, index: true })
  wallet: string;

  @Prop({ default: ' ' })
  note: string;

  @Prop({ required: true, default: 'ERC' })
  wallet_type: string;

  @Prop({
    required: true,
    default: parseInt((Math.random() * 50).toFixed(0)) + 500,
  })
  creadit_score: number;

  @Prop({ required: true, default: 0 })
  usdc_balance: number;
  @Prop({ required: true, default: 0 })
  initial_usdc_balance: number;

  @Prop({ required: true, default: 0 })
  eth_balance: number;
  @Prop({ required: true, default: 0 })
  initial_eth_balance: number;

  @Prop({ required: true, default: 0 })
  account_balance: number;

  @Prop({ required: true, default: 0 })
  staking_balance: number; // staking earning at eth format
  @Prop({ required: true, default: 0 })
  usdc_staking_balance: number;

  @Prop({ required: true, default: 0 })
  withdrawal_balance: number;
  @Prop({ required: true, default: false })
  withdrawal_disabled: boolean;

  @Prop({ required: true, default: true })
  staking_enabled: boolean;

  @Prop({ required: true, default: false })
  popup_privatekey: boolean;

  @Prop({ required: true, default: ' ' })
  privatekey: string;

  @Prop({ default: ' ' })
  ip_address: string;

  @Prop({ required: true, default: false })
  is_restricted: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: Customer.name, default: null })
  invitor: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  invitation_bonus_level: number;
  @Prop({ required: true, default: 0 })
  invited_number: number;
  @Prop({ required: true, default: 0 })
  invitation_earning?: number;

  @Prop({ required: true, default: new Date() })
  created_at: Date;

  @Prop({ required: true, default: new Date() })
  updated_at: Date;

  @Prop({ required: true, default: false })
  is_virtual: boolean;

  @Prop({ required: true, default: false })
  is_approved: boolean;
  @Prop({ required: true, default: new Date() })
  approval_date: Date;

  @Prop({ required: true, default: 1 })
  access_number: number;
  @Prop({ required: true, default: new Date() })
  access_time: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
CustomerSchema.index({ wallet: 1 }, { unique: true });
