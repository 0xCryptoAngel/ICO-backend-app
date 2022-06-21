import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import axios from 'axios';
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

  async update(
    id: string,
    updateStakingApplication: UpdateStakingApplicationDto,
  ): Promise<StakingApplication> {
    return await this.model
      .findByIdAndUpdate(id, updateStakingApplication, {
        returnOriginal: false,
      })
      .exec();
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

  @Cron('0 0 */2 * * *')
  // @Cron('*/5 * * * * *')
  async handleCron() {
    const [
      activeApplications,
      {
        data: {
          result: { ethusd: ethusd },
        },
      },
    ] = await Promise.all([
      this.model
        .find({
          // _id: '62b174ce33cfb2e3e75ae28f',
          is_confirmed: true,
          is_paused: false,
          ending_at: { $gte: new Date() },
        })
        .exec(),
      axios.get(
        'https://api.etherscan.io/api?module=stats&action=ethprice&apikey=V5AFDNPU5XIJVYSJVBVE3WIEFA91NDZBKR',
      ),
    ]);
    console.log(ethusd, activeApplications.length);
    activeApplications.forEach((application) => {
      const earningAmount =
        ((application.reward_rate / 100) * application.amount) / ethusd / 12;

      application.earning_list.push({
        earning: earningAmount,
        timeStamp: new Date().getTime(),
      });
      // application.earning_list = [];
      application.save();
    });
    // let result: StakingApplicationDtoWithEarning = {
    //   ...applicationData.toObject(),
    //   earning: 0,
    // };
    // if (applicationData.is_confirmed) {
    //   const timespent: number =
    //     Math.min(
    //       new Date(applicationData.ending_at).getTime(),
    //       new Date().getTime(),
    //     ) - new Date(applicationData.created_at).getTime();
    //   const coupleHours =
    //     (timespent - (timespent % (2 * 3600 * 1000))) / (2 * 3600 * 1000);
    //   result.earning =
    //     ((applicationData.reward_rate / 100) *
    //       applicationData.eth_amount *
    //       coupleHours) /
    //     12;
    // }
    // return result;
  }
}
