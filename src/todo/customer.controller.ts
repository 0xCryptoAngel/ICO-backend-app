import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import JwtAuthenticationGuard from './authentication/jwt-authentication.guard';
import {
  CreateCustomerDto,
  UpdateCustomerByAdminDto,
  UpdateCustomerDto,
} from './dto/customer.dto';
import { CustomerService } from './customer.service';

@Controller('customers')
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  // Customer

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto, @Ip() ip: string) {
    let _ip = ip.replace('::ffff:', '');
    return await this.service.create(createCustomerDto, _ip);
  }

  @Get(':wallet')
  async getByWallet(@Param('wallet') wallet: string) {
    return await this.service.getByWallet(wallet);
  }

  @Put('public/:wallet')
  async updateByCustomer(
    @Param('wallet') wallet: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return await this.service.updateByCustomer(wallet, {
      ...updateCustomerDto,
      updated_at: new Date(),
    });
  }

  // Admin

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  async index() {
    return await this.service.findAll();
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('level/:level')
  async getByBonusLevel(@Param('level') level: number) {
    return await this.service.getByBonusLevel(level);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Put(':wallet')
  async update(
    @Param('wallet') wallet: string,
    @Body() updateCustomerByAdminDto: UpdateCustomerByAdminDto,
  ) {
    return await this.service.update(wallet, {
      ...updateCustomerByAdminDto,
      updated_at: new Date(),
    });
  }
  // @Delete(':id')
  // async delete(@Param('id') id: string) {
  //   return await this.service.delete(id);
  // }
}
