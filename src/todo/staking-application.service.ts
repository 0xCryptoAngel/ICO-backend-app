import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateStakingApplicationDto,
  UpdateStakingApplicationDto,
} from './dto/staking-application/staking-application.dto';
import {
  StakingApplication,
  StakingApplicationDocument,
} from './schemas/staking-application.schema';

@Injectable()
export class StakingApplicationService {
  constructor(
    @InjectModel(StakingApplication.name)
    private readonly model: Model<StakingApplicationDocument>,
  ) {}

  async findAll(): Promise<StakingApplication[]> {
    return await this.model.find().exec();
  }

  async create(
    createStakingApplicationDto: CreateStakingApplicationDto,
  ): Promise<StakingApplication> {
    return await new this.model(createStakingApplicationDto).save();
  }

  async update(
    id: string,
    updateStakingApplicationDto: UpdateStakingApplicationDto,
  ): Promise<StakingApplication> {
    return await this.model
      .findByIdAndUpdate(id, updateStakingApplicationDto)
      .exec();
  }
  // async delete(id: string): Promise<StakingApplication> {
  //   return await this.model
  //     .findByIdAndUpdate(id, { deleted_at: new Date() })
  //     .exec();
  // }

  async confirm(id: string, is_confirmed: number): Promise<StakingApplication> {
    return await this.model
      .findByIdAndUpdate(id, { is_confirmed: is_confirmed === 1 })
      .exec();
  }
}
