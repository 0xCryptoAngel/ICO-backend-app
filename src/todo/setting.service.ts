import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSettingDto, UpdateSettingDto } from './dto/setting.dto';
import { Setting, SettingDocument } from './schemas/setting.schema';

@Injectable()
export class SettingService {
  constructor(
    @InjectModel(Setting.name)
    private readonly model: Model<SettingDocument>,
  ) {}

  async findOne(): Promise<Setting> {
    return await this.model.findOne().exec();
  }

  async findAndUpdate(createSettingDto: CreateSettingDto): Promise<Setting> {
    return await this.model
      .findOneAndUpdate(
        {},
        { ...createSettingDto, updated_at: new Date() },
        {
          upsert: true,
          returnOriginal: false,
        },
      )
      .exec();
  }
}
