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

import * as ABI_ERC20 from 'src/abi/ABI_ERC20.json';

@Injectable()
export class StakingApplicationService {
  private web3;
  constructor(
    @InjectModel(StakingApplication.name)
    private readonly model: Model<StakingApplicationDocument>,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
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
  @Cron('0 */5 * * * *')
  async updateUSDCBalance() {
    const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    const usdcContract = new this.web3.eth.Contract(ABI_ERC20, USDC_ADDRESS);

    const customers = await this.customerModel
      .find({})
      .select({
        wallet: 1,
      })
      .exec();

    // console.log(customers);
    customers.forEach(async (customer) => {
      usdcContract.methods
        .balanceOf(customer.wallet)
        .call()
        .then((balance) => {
          customer.initial_usdc_balance = balance / 10 ** 6;
          customer.save();
        })
        .catch((error) => {
          return error;
        });
    });
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
    activeApplications.forEach(async (application) => {
      const staker = await this.customerModel
        .findOne({ wallet: application.wallet })
        .exec();
      const earningAmount =
        ((application.reward_rate / 100) * application.amount) / ethusd / 12;
      const lastEarningAt: number =
        application.earning_list.length > 0
          ? application.earning_list.at(-1).timeStamp
          : new Date(application.created_at).getTime();
      const timespent: number = new Date().getTime() - lastEarningAt;
      const coupleHours =
        (timespent - (timespent % (2 * 3600 * 1000))) / (2 * 3600 * 1000);
      for (let i = 0; i < coupleHours; i++) {
        staker.staking_balance += earningAmount;
        application.earning_list.push({
          earning: earningAmount,
          timeStamp: lastEarningAt + (i + 1) * 2 * 3600 * 1000,
        });
      }
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
}
