import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateCustomerDto,
  UpdateCustomerByAdminDto,
  UpdateCustomerDto,
} from './dto/customer.dto';
import { Customer, CustomerDocument } from './schemas/customer.schema';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name)
    private readonly model: Model<CustomerDocument>,
  ) {}
  // Admin API
  async findAll(): Promise<Customer[]> {
    return await this.model.find().exec();
  }
  async getByBonusLevel(invitation_bonus_level: number): Promise<Customer[]> {
    return await this.model.find({ invitation_bonus_level }).exec();
  }

  async update(
    wallet: string,
    updateCustomerByAdminDto: UpdateCustomerByAdminDto,
  ): Promise<Customer> {
    return await this.model
      .findOneAndUpdate({ wallet }, updateCustomerByAdminDto, {
        returnOriginal: false,
      })
      .exec();
  }

  // Customer API

  async getByWallet(wallet: string): Promise<Customer> {
    return await this.model.findOne({ wallet }).exec();
  }
  async updateByCustomer(
    wallet: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    return await this.model
      .findOneAndUpdate({ wallet }, updateCustomerDto, {
        returnOriginal: false,
      })
      .exec();
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    try {
      const createdUser = await new this.model({
        ...createCustomerDto,
      }).save();
      let curInvitor = createCustomerDto.invitor;
      for (let i = 1; i < 4; i++) {
        if (!curInvitor) break;
        const invitor = await this.model.findById(curInvitor).exec();
        if (invitor) {
          invitor.invitation_bonus_level = Math.max(
            invitor.invitation_bonus_level,
            i,
          );
          invitor.save();
          curInvitor = invitor.invitor.toString();
        } else {
          break;
        }
      }

      return createdUser;
    } catch (exception) {
      if (exception.code === 11000) {
        throw new HttpException(
          'User with that wallet address already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // async delete(id: string): Promise<Customer> {
  //   return await this.model
  //     .findByIdAndUpdate(id, { deleted_at: new Date() })
  //     .exec();
  // }
}
