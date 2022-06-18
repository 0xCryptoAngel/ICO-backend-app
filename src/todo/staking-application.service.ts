import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateStakingApplicationDto,
  UpdateStakingApplicationDto,
} from './dto/staking-application.dto';
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
  async getApplicationByWallet(
    wallet: string,
  ): Promise<StakingApplicationDocument> {
    const result = await this.model
      .findOne({ wallet })
      .sort({ ending_at: -1 })
      .exec();
    if (result === null)
      throw new HttpException(
        'Any active staking application for you',
        HttpStatus.NOT_FOUND,
      );
    return result;
  }

  async create(
    createStakingApplicationDto: CreateStakingApplicationDto,
  ): Promise<StakingApplication> {
    const created_at: Date = new Date();
    const pendingApplication = await this.model
      .findOne({
        wallet: createStakingApplicationDto.wallet,
        ending_at: { $gt: created_at },
      })
      .exec();
    if (pendingApplication) {
      throw new HttpException(
        'You have another active staking application right now',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await new this.model(createStakingApplicationDto).save();
  }

  async delete(id: string): Promise<StakingApplication> {
    return await this.model.findByIdAndDelete(id).exec();
  }
  // async delete(id: string): Promise<StakingApplication> {
  //   return await this.model
  //     .findByIdAndUpdate(id, { deleted_at: new Date() })
  //     .exec();
  // }

  async confirm(id: string, is_confirmed: number): Promise<StakingApplication> {
    return await this.model
      .findByIdAndUpdate(
        id,
        { is_confirmed: is_confirmed === 1 },
        { returnOriginal: false },
      )
      .exec();
  }
}
