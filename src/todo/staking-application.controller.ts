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
  UpdateStakingApplicationDto,
} from './dto/staking-application/staking-application.dto';
import { StakingApplicationService } from './staking-application.service';

@Controller('staking-applications')
@UseGuards(JwtAuthenticationGuard)
export class StakingApplicationController {
  constructor(private readonly service: StakingApplicationService) {}

  @Get()
  async index() {
    return await this.service.findAll();
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStakingApplicationDto: UpdateStakingApplicationDto,
  ) {
    return await this.service.update(id, updateStakingApplicationDto);
  }

  @Post()
  async create(
    @Body() createStakingApplicationDto: CreateStakingApplicationDto,
  ) {
    return await this.service.create(createStakingApplicationDto);
  }

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
