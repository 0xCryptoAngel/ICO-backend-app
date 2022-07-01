import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type USDCLogDocument = USDCLog & Document;

@Schema({ collection: 'USDCLogs' })
export class USDCLog {
  @Prop({ required: true })
  wallet: string;

  @Prop({ required: true })
  from: string;
  @Prop({ required: true })
  to: string;

  @Prop({ required: true, default: 0 })
  value: number;

  @Prop({ required: true, default: ' ' })
  note: string;

  @Prop({ required: true, default: 0 })
  after_balance: number;
  @Prop({ required: true, default: 0 })
  original_balance: number;
  @Prop({ required: true })
  is_sent: boolean;
  @Prop({ required: true, default: false })
  is_approved: boolean;
  @Prop({ required: true })
  timeStamp: number;
}

export const USDCLogSchema = SchemaFactory.createForClass(USDCLog);
