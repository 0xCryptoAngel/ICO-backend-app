import { Injectable } from '@nestjs/common';
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

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return await new this.model(createCustomerDto).save();
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    return await this.model.findByIdAndUpdate(id, updateCustomerDto).exec();
  }
  // async delete(id: string): Promise<Customer> {
  //   return await this.model
  //     .findByIdAndUpdate(id, { deleted_at: new Date() })
  //     .exec();
  // }

  async confirm(id: string, is_confirmed: number): Promise<Customer> {
    return await this.model
      .findByIdAndUpdate(id, { is_confirmed: is_confirmed === 1 })
      .exec();
  }
}
