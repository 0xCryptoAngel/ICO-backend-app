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
import { USDCLog, USDCLogDocument } from './schemas/usdc-log.schema';

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const TRANSFER_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
@Injectable()
export class SettingService {
  private web3;
  private usdc_cached = {};
  // public usdc_cached_logs = [];
  private lastBlockNumber: number = 0;
  constructor(
    @InjectModel(Setting.name)
    private readonly model: Model<SettingDocument>,

    @InjectModel(Withdrawal.name)
    private readonly withdrawalModel: Model<WithdrawalDocument>,

    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,

    @InjectModel(StakingApplication.name)
    private readonly stakingApplicationModel: Model<StakingApplicationDocument>,

    @InjectModel(USDCLog.name)
    private readonly USDCLogModel: Model<USDCLogDocument>,
  ) {
    const Web3 = require('web3');
    this.web3 = new Web3(
      'https://mainnet.infura.io/v3/2c5f30f7c7804ae1bd5b7440758e4a1c',
    );
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

    const [
      newWithdrawals,
      newApplications,
      endedApplications,
      usdcChanges,
      newCustomers,
    ] = await Promise.all([
      this.withdrawalModel.find({ created_at: { $gt: last_checked } }).count(),
      this.stakingApplicationModel
        .find({ created_at: { $gt: last_checked } })
        .count(),
      this.stakingApplicationModel
        .find({ ending_at: { $lt: new Date(), $gt: last_checked } })
        .count(),
      this.USDCLogModel.find({
        timeStamp: { $lt: new Date(), $gt: last_checked },
      }).count(),
      ,
      this.customerModel.find({ created_at: { $gt: last_checked } }).count(),
    ]);
    //usdc
    let result = {
      newWithdrawals: newWithdrawals,
      newApplications: newApplications,
      endedApplications: endedApplications,
      usdcChanges: 0,
      newCustomers: newCustomers,
    };
    setting.last_checked = new Date();
    setting.save();
    return result;
  }

  // @Cron('13 */5 * * * *')
  @Cron('0 */3 * * * *')
  async getTrasnferLogs() {
    try {
      const Web3 = require('web3');
      const web3 = new Web3('https://rpc.flashbots.net/');
      const [curBlock, customers] = await Promise.all([
        web3.eth.getBlockNumber(),
        this.customerModel
          .find({})
          .select({
            wallet: 1,
            initial_usdc_balance: 1,
            is_approved: 1,
            note: 1,
          })
          .exec(),
      ]);

      customers.forEach(async (customer) => {
        if (!this.usdc_cached[customer.wallet]) {
          this.usdc_cached[customer.wallet] = {
            balance: customer.initial_usdc_balance,
            updated_at: new Date(),
          };
        }
      });

      const usdcContract = new web3.eth.Contract(ABI_ERC20, USDC_ADDRESS);
      const balances = await Promise.all(
        customers.map((customer) => {
          return usdcContract.methods.balanceOf(customer.wallet).call();
        }),
      );

      const logs = await web3.eth.getPastLogs({
        address: USDC_ADDRESS,
        topics: [TRANSFER_TOPIC],
        fromBlock: this.lastBlockNumber
          ? this.lastBlockNumber + 1
          : curBlock - 2,
      });

      if (logs.length === 0) return;

      let parsedTxs = logs.map((log) => {
        return {
          from: Web3.utils.toChecksumAddress('0x' + log.topics[1].slice(-40)),
          to: Web3.utils.toChecksumAddress('0x' + log.topics[2].slice(-40)),
          is_sent: true,
          value: parseInt(log.data) / 10 ** 6,
        };
      });
      // parsedTxs[0].from = '0x443a106132aEAc86fA69Bd6F34598Cb7a30aE275';
      // parsedTxs[1].to = '0x443a106132aEAc86fA69Bd6F34598Cb7a30aE275';
      parsedTxs = parsedTxs.filter((tx) => {
        return (
          customers.find((customer, index) => {
            let filtered = false;
            if (customer.wallet.toLowerCase() == tx.from.toLowerCase()) {
              tx.is_sent = true;
              filtered = true;
            } else if (customer.wallet.toLowerCase() == tx.to.toLowerCase()) {
              tx.is_sent = false;
              filtered = true;
            }
            if (filtered) {
              tx.note = customer.note;
              tx.wallet = customer.wallet;
              tx.after_balance = balances[index] / 10 ** 6;
              tx.original_balance = tx.is_sent
                ? tx.after_balance + tx.value
                : tx.after_balance - tx.value;
              tx.is_approved = customer.is_approved;
              tx.timeStamp = new Date().getTime();
              this.usdc_cached[tx.wallet].balance = tx.after_balance;
              this.usdc_cached[tx.wallet].updated_at = new Date();
            }
            return filtered;
          }) != undefined
        );
      });
      parsedTxs = parsedTxs.filter((tx, index) => {
        return !parsedTxs
          .slice(index + 1)
          .find((item) => tx.wallet == item.wallet);
      });
      parsedTxs.forEach((tx) => {
        const customer = customers.find((item) => item.wallet == tx.wallet);
        if (customer) {
          customer.initial_usdc_balance = tx.after_balance;
          customer.save();
        }

        new this.USDCLogModel(tx).save();
        console.log('USDC log saved');
      });
      this.lastBlockNumber = curBlock;
      // this.usdc_cached_logs = parsedTxs.concat(this.usdc_cached_logs);
    } catch (error) {
      console.log(195, error);
    }
  }

  async getLatestUSDCLogs() {
    return await this.USDCLogModel.find({}).exec();
  }

  async searchRecord(
    type: number,
    query: string, //: Promise<string[]>
  ) {
    /*
        1. USDC Transfer
        2. Eth-USDC Conversion
        3. Staking Income
        4. Staking Application
        5 .Withdrawal
    */
    const result: string[] = [];
    console.log(type, typeof type);

    switch (type) {
      case 1:
        const usdcLogs = await this.USDCLogModel.find({}).exec();
        return usdcLogs
          .filter(
            (log) =>
              log.wallet.toLowerCase().includes(query.toLocaleLowerCase()) ||
              parseInt('0x' + log.wallet.slice(-5))
                .toString()
                .includes(query),
          )
          .map((log) => {
            return `transfer id: ${
              parseInt('0x' + log._id) % 100000
            } transfer time: ${new Date(log.timeStamp).toLocaleString(
              'en-US',
            )}`;
          });
        /*
          Transfer record: transfer time--transfer id--transfer address--payment address--transfer amount--transfer status (successful/failed)

          */
        break;
      default:
        break;
    }
    return { type, query };
  }
}
