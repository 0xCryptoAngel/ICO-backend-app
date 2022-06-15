import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
  providers: [
    StakingOptionService,
    StakingApplicationService,
    WithdrawalService,
    CustomerService,
  ],
  controllers: [
    StakingOptionController,
    StakingApplicationController,
    WithdrawalController,
    CustomerController,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: StakingOption.name, schema: StakingOptionSchema },
      { name: StakingApplication.name, schema: StakingApplicationSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
    AuthenticationModule,
  ],
})
export class TodoModule {}
