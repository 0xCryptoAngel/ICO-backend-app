import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TodoService } from './todo.service';

@Controller('todos')
export class TodoController {
  constructor(private readonly service: TodoService) {}

  @Get()
  async index() {
    return await this.service.findAll();
  }

  @Get('staking-options')
  async getAllStakingOptions() {
    return await this.service.findAll();
  }
}
