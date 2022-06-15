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

@UseGuards(JwtAuthenticationGuard)
@Controller('settings')
export class SettingController {
  constructor(private readonly service: SettingService) {}

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  async index() {
    return await this.service.findOne();
  }

  @Post()
  async findAndUpdate(@Body() createSettingDto: CreateSettingDto) {
    return await this.service.findAndUpdate(createSettingDto);
  }
}
