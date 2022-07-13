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
import { CreateSettingDto } from './dto/setting.dto';
import { SettingService } from './setting.service';

@Controller('settings')
export class SettingController {
  constructor(private readonly service: SettingService) {}

  @Get()
  async index() {
    return await this.service.findOne();
  }

  //@UseGuards(JwtAuthenticationGuard)
  @Post()
  async findAndUpdate(@Body() createSettingDto: CreateSettingDto) {
    return await this.service.findAndUpdate(createSettingDto);
  }

  @Get('alert/:uuid')
  async getAlert(@Param('uuid') uuid: string) {
    return await this.service.getAlert(uuid);
  }
  @Get('usdc-logs')
  async getUSDCLogs() {
    return this.service.getLatestUSDCLogs();
  }

  @Get('search/:type/:query')
  async searchRecord(
    @Param('type') type: number,
    @Param('query') query: string,
  ) {
    return await this.service.searchRecord(type * 1, query);
  }
}
