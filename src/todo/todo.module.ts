import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Todo, TodoSchema } from './schemas/todo.schema';
import { AuthenticationModule } from './authentication/authentication.module';
import { StakingOptionController } from './staking-option.controller';
import { StakingOptionService } from './staking-option.service';
import {
  StakingOption,
  StakingOptionSchema,
} from './schemas/staking-option.schema';

@Module({
  providers: [TodoService, StakingOptionService],
  controllers: [TodoController, StakingOptionController],
  imports: [
    MongooseModule.forFeature([
      { name: Todo.name, schema: TodoSchema },
      { name: StakingOption.name, schema: StakingOptionSchema },
    ]),
    AuthenticationModule,
  ],
})
export class TodoModule {}
