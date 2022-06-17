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
  StakingApplicationDtoWithEarning,
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
  ): Promise<StakingApplicationDtoWithEarning> {
    const applicationData: StakingApplicationDocument =
      await this.service.getApplicationByWallet(wallet);
    let result: StakingApplicationDtoWithEarning = {
      ...applicationData.toObject(),
      earning: 0,
    };
    if (applicationData.is_confirmed) {
      const timespent: number =
        new Date().getTime() - new Date(applicationData.created_at).getTime();
      const coupleHours =
        (timespent - (timespent % (2 * 3600 * 1000))) / (2 * 3600 * 1000);
      result.earning =
        ((applicationData.reward_rate / 100) *
          applicationData.eth_amount *
          coupleHours) /
        12;
    }
    return result;
  }

  // @Put(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateStakingApplicationDto: UpdateStakingApplicationDto,
  // ) {
  //   return await this.service.update(id, updateStakingApplicationDto);
  // }

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
