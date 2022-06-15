import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StakingOptionDocument = StakingOption & Document;

@Schema({ collection: 'staking-options' })
export class StakingOption {
  @Prop({ required: true })
  startAmount: number;

  @Prop({ required: true })
  endAmount: number;

  @Prop({ required: true, default: [] })
  starkingReward: Array<{
    duration: number;
    rewardRate: number;
  }>;

  @Prop({ required: true, default: [] })
  descriptions: Array<string>;
}

export const StakingOptionSchema = SchemaFactory.createForClass(StakingOption);
