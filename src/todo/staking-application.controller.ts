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
  CreateStakingApplicationDto,
  StakingApplicationDto,
  UpdateStakingApplicationDto,
} from './dto/staking-application.dto';
import {
  StakingApplication,
  StakingApplicationDocument,
} from './schemas/staking-application.schema';
import { StakingApplicationService } from './staking-application.service';

@Controller('staking-applications')
export class StakingApplicationController {
  constructor(private readonly service: StakingApplicationService) {}

  //@UseGuards(JwtAuthenticationGuard)
  @Get()
  async index(): Promise<StakingApplication[]> {
    return await this.service.findAll();
  }

  @Get(':wallet')
  async applicationByWallet(
    @Param('wallet') wallet: string,
  ): Promise<StakingApplicationDto[]> {
    return await this.service.getApplicationByWallet(wallet);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStakingApplication: UpdateStakingApplicationDto,
  ) {
    return await this.service.update(id, updateStakingApplication);
  }

  @Post()
  async create(
    @Body() createStakingApplicationDto: CreateStakingApplicationDto,
  ) {
    return await this.service.create(createStakingApplicationDto);
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
