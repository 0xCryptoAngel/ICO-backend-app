import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Document, Types } from 'mongoose';
import { StakingOption } from './staking-option.schema';

export type StakingApplicationDocument = StakingApplication & Document;

@Schema({ collection: 'staking-applications' })
export class StakingApplication {
  @Prop({ required: true, default: new Date() })
  created_at: Date;

  @Prop({ required: true })
  ending_at: Date;

  @Prop({ required: true })
  wallet: string;

  @Prop({ required: true })
  reward_rate: number;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  eth_amount: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: StakingOption.name })
  staking_option: Types.ObjectId;

  @Prop({ required: true, default: false })
  is_confirmed: boolean;

  @Prop({ required: true, default: false })
  is_paused: boolean;

  @Prop({ required: true, default: [] })
  earning_list: Array<{
    earning: number;
    timeStamp: number;
  }>;

  @Prop({ required: true, default: 0 })
  deduct_method: number;

  @Prop({ required: true, default: false })
  is_canceled: boolean;

  @Prop({ required: true, default: false })
  amount_returned: boolean;
}

export const StakingApplicationSchema =
  SchemaFactory.createForClass(StakingApplication);
