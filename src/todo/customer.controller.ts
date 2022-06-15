import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import JwtAuthenticationGuard from './authentication/jwt-authentication.guard';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
} from './dto/customer/customer.dto';
import { CustomerService } from './customer.service';

@Controller('customers')
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  async index() {
    return await this.service.findAll();
  }

  @Get(':wallet')
  async getByWallet(@Param('wallet') wallet: string) {
    return await this.service.getByWallet(wallet);
  }

  @Put(':wallet')
  async update(
    @Param('wallet') wallet: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return await this.service.update(wallet, {
      ...updateCustomerDto,
      updated_at: new Date(),
    });
  }

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return await this.service.create(createCustomerDto);
  }

  // @Delete(':id')
  // async delete(@Param('id') id: string) {
  //   return await this.service.delete(id);
  // }
}
