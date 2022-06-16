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
import { CreateWithdrawalDto } from './dto/withdrawal.dto';
import { WithdrawalService } from './withdrawal.service';

@Controller('withdrawals')
export class WithdrawalController {
  constructor(private readonly service: WithdrawalService) {}

  //@UseGuards(JwtAuthenticationGuard)
  @Get()
  async index() {
    return await this.service.findAll();
  }

  // @Put(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateWithdrawalDto: UpdateWithdrawalDto,
  // ) {
  //   return await this.service.update(id, updateWithdrawalDto);
  // }

  @Post()
  async create(@Body() createWithdrawalDto: CreateWithdrawalDto) {
    return await this.service.create(createWithdrawalDto);
  }

  //@UseGuards(JwtAuthenticationGuard)
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
