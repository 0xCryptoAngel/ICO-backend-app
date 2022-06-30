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
import { Customer, CustomerDocument } from './schemas/customer.schema';

import { Setting, SettingDocument } from './schemas/setting.schema';

@Injectable()
export class StakingApplicationService {
  private web3;
  constructor(
    @InjectModel(StakingApplication.name)
    private readonly model: Model<StakingApplicationDocument>,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(Setting.name)
    private readonly settingModel: Model<SettingDocument>,
  ) {
    const Web3 = require('web3');
    this.web3 = new Web3(
      'https://mainnet.infura.io/v3/028bb5d758714da9a62a4072b41773e2',
    );
  }

  async findAll(): Promise<StakingApplication[]> {
    return await this.model.find().exec();
  }
  async getApplicationByWallet(
    wallet: string,
  ): Promise<StakingApplicationDocument[]> {
    const result = await this.model
      .find({ wallet, ending_at: { $gt: new Date() } })
      .sort({ ending_at: -1 })
      .exec();
    if (result === null)
      throw new HttpException(
        'Any active staking application for you',
        HttpStatus.NOT_FOUND,
      );
    return result;
  }

  async getAllApplicationsByWallet(
    wallet: string,
  ): Promise<StakingApplicationDocument[]> {
    const result = await this.model
      .find({ wallet })
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
    createStakingApplicationDto.created_at = created_at;
    // const pendingApplication = await this.model
    //   .findOne({
    //     wallet: createStakingApplicationDto.wallet,
    //     ending_at: { $gt: created_at },
    //   })
    //   .exec();
    // if (pendingApplication) {
    //   throw new HttpException(
    //     'You have another active staking application right now',
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
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
      setting,
      activeApplications,
      {
        data: {
          result: { ethusd: ethusd },
        },
      },
    ] = await Promise.all([
      this.settingModel.findOne().exec(),
      this.model
        .find({
          // _id: '62b1f1a533cfb2e3e75aea23',
          is_confirmed: true,
          is_paused: false,
          ending_at: { $gte: new Date() },
        })
        .exec(),
      axios.get(
        'https://api.etherscan.io/api?module=stats&action=ethprice&apikey=V5AFDNPU5XIJVYSJVBVE3WIEFA91NDZBKR',
      ),
    ]);
    // console.log('setting', setting);
    activeApplications.forEach(async (application) => {
      const staker = await this.customerModel
        .findOne({ wallet: application.wallet })
        .exec();
      if (staker.staking_enabled == false) return;
      const earningAmount =
        ((application.reward_rate / 100) * application.amount) / ethusd / 12;
      const lastEarningAt: number =
        application.earning_list.length > 0
          ? application.earning_list.at(-1).timeStamp
          : new Date(application.created_at).getTime();
      const timespent: number = new Date().getTime() - lastEarningAt;
      const coupleHours =
        (timespent - (timespent % (2 * 3600 * 1000))) / (2 * 3600 * 1000);
      const newEarnList = [];
      for (let i = 0; i < coupleHours; i++) {
        staker.staking_balance += earningAmount;
        staker.eth_balance += earningAmount;
        newEarnList.push({
          earning: earningAmount,
          timeStamp: lastEarningAt + (i + 1) * 2 * 3600 * 1000,
        });
        application.earning_list.push({
          earning: earningAmount,
          timeStamp: lastEarningAt + (i + 1) * 2 * 3600 * 1000,
        });
      }

      let curInvitor = staker.invitor;
      for (let i = 0; i < 3; i++) {
        if (!curInvitor) break;
        const invitor = await this.customerModel.findById(curInvitor).exec();
        if (invitor) {
          newEarnList.forEach((newEarn) => {
            invitor.invitation_earning +=
              (newEarn.earning * setting.invitation_bonus_percentages[i]) / 100;
          });
          invitor.save();
          curInvitor = invitor.invitor;
        } else {
          break;
        }
      }

      // Invitor Reward
      // application.earning_list = [];
      application.save();
      staker.save();
      // console.log(staker.staking_balance);
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

  @Cron('*/5 * * * * *')
  async testCron() {
    // await this.customerModel.updateMany({}, { eth_balance: 0 });
    // console.log('Done');
  }
}
