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

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return await this.service.update(id, updateCustomerDto);
  }

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return await this.service.create(createCustomerDto);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Put('confirm/:id/:is_confirmed')
  async confirm(
    @Param('id') id: string,
    @Param('is_confirmed') is_confirmed: any,
  ) {
    return await this.service.confirm(id, parseInt(is_confirmed));
  }

  // @Delete(':id')
  // async delete(@Param('id') id: string) {
  //   return await this.service.delete(id);
  // }
}
