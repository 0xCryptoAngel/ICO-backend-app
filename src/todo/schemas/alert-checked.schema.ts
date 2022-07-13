import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AlertCheckedDocument = AlertChecked & Document;

@Schema({ collection: 'alert-chekced' })
export class AlertChecked {
  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  timestamp: number;
}

export const AlertCheckedSchema = SchemaFactory.createForClass(AlertChecked);
