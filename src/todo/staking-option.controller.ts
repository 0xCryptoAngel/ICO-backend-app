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
  CreateStakingOptionDto,
  UpdateStakingOptionDto,
} from './dto/staking-option/staking-option.dto';
import { StakingOptionService } from './staking-option.service';

@Controller('staking-options')
@UseGuards(JwtAuthenticationGuard)
export class StakingOptionController {
  constructor(private readonly service: StakingOptionService) {}

  @Get()
  async index() {
    return await this.service.findAll();
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStakingOptionDto: UpdateStakingOptionDto,
  ) {
    return await this.service.update(id, updateStakingOptionDto);
  }

  @Post()
  async create(@Body() createStakingOptionDto: CreateStakingOptionDto) {
    return await this.service.create(createStakingOptionDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
