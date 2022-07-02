import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Document, Types } from 'mongoose';

export type EthUSDCConversionDocument = EthUSDCConversion & Document;
@Schema({ collection: 'eth-usdc-conversion' })
export class EthUSDCConversion {
  @Prop({ required: true })
  wallet: string;

  @Prop({ required: true, default: 0 })
  eth_amount: number;
  @Prop({ required: true, default: 0 })
  usdc_amount: number;

  @Prop({ required: true, default: new Date() })
  created_at: Date;
}

export const EthUSDCConversionSchema =
  SchemaFactory.createForClass(EthUSDCConversion);
