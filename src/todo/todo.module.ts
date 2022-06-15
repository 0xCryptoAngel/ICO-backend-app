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
import {
  StakingApplication,
  StakingApplicationSchema,
} from './schemas/staking-application.schema';
import { StakingApplicationController } from './staking-application.controller';
import { StakingApplicationService } from './staking-application.service';
import { Withdrawal, WithdrawalSchema } from './schemas/withdrawal.schema';
import { WithdrawalController } from './withdrawal.controller';
import { WithdrawalService } from './withdrawal.service';

@Module({
  providers: [
    TodoService,
    StakingOptionService,
    StakingApplicationService,
    WithdrawalService,
  ],
  controllers: [
    TodoController,
    StakingOptionController,
    StakingApplicationController,
    WithdrawalController,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: Todo.name, schema: TodoSchema },
      { name: StakingOption.name, schema: StakingOptionSchema },
      { name: StakingApplication.name, schema: StakingApplicationSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
    ]),
    AuthenticationModule,
  ],
})
export class TodoModule {}
