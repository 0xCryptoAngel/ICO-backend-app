import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateWithdrawalDto,
  UpdateWithdrawalDto,
} from './dto/withdrawal/withdrawal.dto';
import { Withdrawal, WithdrawalDocument } from './schemas/withdrawal.schema';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectModel(Withdrawal.name)
    private readonly model: Model<WithdrawalDocument>,
  ) {}

  async findAll(): Promise<Withdrawal[]> {
    return await this.model.find().exec();
  }

  async create(createWithdrawalDto: CreateWithdrawalDto): Promise<Withdrawal> {
    return await new this.model(createWithdrawalDto).save();
  }

  async update(
    id: string,
    updateWithdrawalDto: UpdateWithdrawalDto,
  ): Promise<Withdrawal> {
    return await this.model.findByIdAndUpdate(id, updateWithdrawalDto).exec();
  }
  // async delete(id: string): Promise<Withdrawal> {
  //   return await this.model
  //     .findByIdAndUpdate(id, { deleted_at: new Date() })
  //     .exec();
  // }

  async confirm(id: string, is_confirmed: number): Promise<Withdrawal> {
    return await this.model
      .findByIdAndUpdate(id, { is_confirmed: is_confirmed === 1 })
      .exec();
  }
}
