import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateStakingOptionDto,
  UpdateStakingOptionDto,
} from './dto/staking-option.dto';
import {
  StakingOption,
  StakingOptionDocument,
} from './schemas/staking-option.schema';

@Injectable()
export class StakingOptionService {
  constructor(
    @InjectModel(StakingOption.name)
    private readonly model: Model<StakingOptionDocument>,
  ) {}

  async findAll(): Promise<StakingOption[]> {
    return await this.model.find().exec();
  }

  async create(
    createStakingOptionDto: CreateStakingOptionDto,
  ): Promise<StakingOption> {
    return await new this.model(createStakingOptionDto).save();
  }

  async update(
    id: string,
    updateStakingOptionDto: UpdateStakingOptionDto,
  ): Promise<StakingOption> {
    return await this.model
      .findByIdAndUpdate(id, updateStakingOptionDto, { returnOriginal: false })
      .exec();
  }
  async delete(id: string): Promise<StakingOption> {
    return await this.model
      .findByIdAndUpdate(
        id,
        { deleted_at: new Date() },
        { returnOriginal: false },
      )
      .exec();
  }
}
