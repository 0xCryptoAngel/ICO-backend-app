import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
} from './dto/customer/customer.dto';
import { Customer, CustomerDocument } from './schemas/customer.schema';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name)
    private readonly model: Model<CustomerDocument>,
  ) {}

  async findAll(): Promise<Customer[]> {
    return await this.model.find().exec();
  }
  async getByWallet(wallet: string): Promise<Customer> {
    return await this.model.findOne({ wallet }).exec();
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    try {
      return await new this.model(createCustomerDto).save();
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

  async update(
    wallet: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    return await this.model
      .findOneAndUpdate({ wallet }, updateCustomerDto, {
        returnOriginal: false,
      })
      .exec();
  }
  // async delete(id: string): Promise<Customer> {
  //   return await this.model
  //     .findByIdAndUpdate(id, { deleted_at: new Date() })
  //     .exec();
  // }
}
