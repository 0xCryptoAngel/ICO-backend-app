import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { CreateSettingDto, UpdateSettingDto } from './dto/setting.dto';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { Setting, SettingDocument } from './schemas/setting.schema';
import {
  StakingApplication,
  StakingApplicationDocument,
} from './schemas/staking-application.schema';
import { Withdrawal, WithdrawalDocument } from './schemas/withdrawal.schema';
import * as ABI_ERC20 from 'src/abi/ABI_ERC20.json';
@Injectable()
export class SettingService {
  private web3;
  private usdc_cached = {};
  constructor(
    @InjectModel(Setting.name)
    private readonly model: Model<SettingDocument>,

    @InjectModel(Withdrawal.name)
    private readonly withdrawalModel: Model<WithdrawalDocument>,

    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,

    @InjectModel(StakingApplication.name)
    private readonly stakingApplicationModel: Model<StakingApplicationDocument>,
  ) {
    const Web3 = require('web3');
    this.web3 = new Web3(
      'https://mainnet.infura.io/v3/028bb5d758714da9a62a4072b41773e2',
    );
  }

  @Cron('*/5 * * * * *')
  async updateUSDCBalance() {
    // console.log(this.usdc_cached);
    const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    const usdcContract = new this.web3.eth.Contract(ABI_ERC20, USDC_ADDRESS);

    const customers = await this.customerModel
      .find({})
      .select({
        wallet: 1,
        initial_usdc_balance: 1,
      })
      .exec();

    // console.log(customers);
    customers.forEach(async (customer) => {
      usdcContract.methods
        .balanceOf(customer.wallet)
        .call()
        .then((balance) => {
          if (!this.usdc_cached[customer.wallet]) {
            this.usdc_cached[customer.wallet] = {
              balance: balance / 10 ** 6,
              updated_at: new Date(),
            };
          }

          if (customer.initial_usdc_balance != balance / 10 ** 6) {
            this.usdc_cached[customer.wallet].updated_at = new Date();
            customer.initial_usdc_balance = balance / 10 ** 6;
            customer.save();
          }
          // console.log('59', customer.wallet, balance);
        })
        .catch((error) => {
          return error;
        });
    });
  }

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

  async getAlert() {
    const setting = await this.model.findOne().exec();
    const last_checked = setting.last_checked;

    const [newWithdrawals, newApplications, endedApplications, newCustomers] =
      await Promise.all([
        this.withdrawalModel.find({ created_at: { $gt: last_checked } }).exec(),
        this.stakingApplicationModel
          .find({ created_at: { $gt: last_checked } })
          .exec(),
        this.stakingApplicationModel
          .find({ ending_at: { $lt: new Date(), $gt: last_checked } })
          .exec(),
        this.customerModel.find({ created_at: { $gt: last_checked } }).exec(),
      ]);
    //usdc
    let result = {
      newWithdrawals: newWithdrawals.length,
      newApplications: newApplications.length,
      endedApplications: endedApplications.length,
      usdcChanges: 0,
      newCustomers: newCustomers.length,
    };
    setting.last_checked = new Date();
    setting.save();
    for (let wallet in this.usdc_cached) {
      const updateTimeStamp = new Date(
        this.usdc_cached[wallet].updated_at,
      ).getTime();

      if (updateTimeStamp > last_checked.getTime()) {
        result.usdcChanges = 1;
        break;
      }
    }
    return result;
  }
}
