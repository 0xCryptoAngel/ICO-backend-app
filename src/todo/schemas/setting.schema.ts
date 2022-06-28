import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingDocument = Setting & Document;

@Schema({ collection: 'settings' })
export class Setting {
  @Prop({ required: true })
  contract_address: string;

  @Prop({ required: true, default: ' ' })
  usdc_vault: string;

  @Prop({ required: true, default: [0, 0, 0] })
  invitation_bonus_percentages: Array<number>;

  @Prop({ required: true, default: new Date() })
  created_at: Date;

  @Prop({ required: true, default: new Date() })
  updated_at: Date;

  @Prop({ required: true, default: new Date() })
  last_checked: Date;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
