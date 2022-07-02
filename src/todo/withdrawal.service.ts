import {
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWithdrawalDto, UpdateWithdrawalDto } from './dto/withdrawal.dto';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { Withdrawal, WithdrawalDocument } from './schemas/withdrawal.schema';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectModel(Withdrawal.name)
    private readonly model: Model<WithdrawalDocument>,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
  ) {}

  async findAll(): Promise<Withdrawal[]> {
    return await this.model.find().exec();
  }
  async getWithdrawalsByWallet(wallet: string): Promise<Withdrawal[]> {
    return await this.model.find({ wallet }).exec();
  }

  async create(createWithdrawalDto: CreateWithdrawalDto): Promise<Withdrawal> {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthlyWithdrawals = await this.model
      .find({
        created_at: { $gt: firstDay },
        is_confirmed: true,
        wallet: createWithdrawalDto.wallet,
      })
      .count();
    console.log(monthlyWithdrawals);
    if (monthlyWithdrawals === 3) {
      throw new HttpException(
        'You exceeded max withrawal counts',
        HttpStatus.BAD_REQUEST,
      );
    }
    // return;
    createWithdrawalDto.created_at = new Date();
    return await new this.model(createWithdrawalDto).save();
  }

  async update(
    id: string,
    updateWithdrawalDto: UpdateWithdrawalDto,
  ): Promise<Withdrawal> {
    return await this.model
      .findByIdAndUpdate(id, updateWithdrawalDto, { returnOriginal: false })
      .exec();
  }
  // async delete(id: string): Promise<Withdrawal> {
  //   return await this.model
  //     .findByIdAndUpdate(id, { deleted_at: new Date() })
  //     .exec();
  // }

  async confirm(id: string, is_confirmed: number): Promise<Withdrawal> {
    const updatedWithdrawal = await this.model
      .findByIdAndUpdate(
        id,
        { is_confirmed: is_confirmed === 1, is_checked: true },
        { returnOriginal: false },
      )
      .exec();
    if (is_confirmed === 0) {
      this.customerModel
        .findOne({ wallet: updatedWithdrawal.wallet })
        .exec()
        .then((customer) => {
          if (customer) {
            customer.usdc_balance += updatedWithdrawal.amount;
            customer.save();
          }
        });
    }
    return updatedWithdrawal;
  }
}
