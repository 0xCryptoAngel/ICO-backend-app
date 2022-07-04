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
      'https://mainnet.infura.io/v3/2c5f30f7c7804ae1bd5b7440758e4a1c',
    );
  }

  async findAll(): Promise<StakingApplication[]> {
    return await this.model.find({ is_canceled: false }).exec();
  }
  async getApplicationByWallet(
    wallet: string,
  ): Promise<StakingApplicationDocument[]> {
    const result = await this.model
      .find({ wallet })
      // .find({ wallet, ending_at: { $gt: new Date() } })
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
    const pendingApplication = await this.model
      .findOne({
        wallet: createStakingApplicationDto.wallet,
        ending_at: { $gt: created_at },
      })
      .exec();
    /*    if (pendingApplication) {
      pendingApplication.reward_rate = Math.max(
        pendingApplication.reward_rate,
        createStakingApplicationDto.reward_rate,
      );
      pendingApplication.amount += createStakingApplicationDto.amount;
      pendingApplication.eth_amount += createStakingApplicationDto.eth_amount;
      pendingApplication.ending_at = new Date(
        Math.max(
          new Date(pendingApplication.ending_at).getTime(),
          new Date(createStakingApplicationDto.ending_at).getTime(),
        ),
      );
      pendingApplication.save();
      return pendingApplication;
    }*/
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
  async cancel(id: string): Promise<StakingApplication> {
    return await this.model
      .findByIdAndUpdate(
        id,
        {
          is_canceled: true,
        },
        {
          returnOriginal: false,
        },
      )
      .exec();
  }

  // async delete(id: string): Promise<StakingApplication> {
  //   return await this.model
  //     .findByIdAndUpdate(id, { deleted_at: new Date() })
  //     .exec();
  // }

  async confirm(
    id: string,
    is_confirmed: number,
    deduct_method: number,
  ): Promise<StakingApplication> {
    const stakingObj = await this.model.findById(id).exec();

    if (is_confirmed === 1) {
      const staker = await this.customerModel
        .findOne({ wallet: stakingObj.wallet })
        .exec();
      if (deduct_method === 2) staker.usdc_balance -= stakingObj.amount;
      // if (staker.usdc_balance < 0) {
      //   throw new HttpException(
      //     'You have low usdc Balance',
      //     HttpStatus.BAD_REQUEST,
      //   );
      // }
      staker.save();

      const activeApplication = await this.model
        .findOne({
          id: { $ne: stakingObj._id },
          wallet: stakingObj.wallet,
          ending_at: { $gt: new Date() },
        })
        .exec();
      if (activeApplication) {
        if (activeApplication.reward_rate > stakingObj.reward_rate) {
          activeApplication.amount += stakingObj.amount;
          activeApplication.eth_amount += stakingObj.eth_amount;
          activeApplication.earning_list =
            activeApplication.earning_list.concat(stakingObj.earning_list);
          activeApplication.deduct_method = deduct_method;
          activeApplication.save();
          stakingObj.delete();
          return activeApplication;
        } else {
          stakingObj.amount += activeApplication.amount;
          stakingObj.eth_amount += activeApplication.eth_amount;
          stakingObj.is_confirmed = true;
          stakingObj.deduct_method = deduct_method;
          stakingObj.earning_list = stakingObj.earning_list.concat(
            activeApplication.earning_list,
          );
          activeApplication.delete();
          stakingObj.save();
          return activeApplication;
        }
      }
    }
    stakingObj.is_confirmed = 1 == is_confirmed;
    stakingObj.save();
    return stakingObj;
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
          // wallet: '0x0655f5CaE55bF268Ea6CB5A097f741775F89a07c',
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
      const highest_reward_rate = Math.max(
        ...activeApplications
          .filter((item) => item.wallet === application.wallet)
          .map((item) => item.reward_rate),
      );
      console.log(
        highest_reward_rate,
        'highest_reward_rate for ',
        application.wallet,
      );
      // return;
      if (
        new Date(application.ending_at).getTime() <
        new Date().getTime() + 3600 * 1000 * 2
      ) {
        staker.usdc_balance += application.amount;
      }
      if (staker.staking_enabled == false) return;
      const earningAmount =
        ((highest_reward_rate / 100) * application.amount) / ethusd / 12;
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
    // await this.model.updateMany({}, { is_canceled: false });
    // console.log('Done');
  }
}
