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
import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';
import { Setting, SettingSchema } from './schemas/setting.schema';
import { USDCLog, USDCLogSchema } from './schemas/usdc-log.schema';
import {
  EthUSDCConversion,
  EthUSDCConversionSchema,
} from './schemas/eth-usdc-conversion.schema';
import { EthUSDCConversionController } from './eth-usdc-conversion.controller';
import { EthUSDCConversionService } from './eth-usdc-conversion.service';

@Module({
  providers: [
    StakingOptionService,
    StakingApplicationService,
    WithdrawalService,
    CustomerService,
    SettingService,
    EthUSDCConversionService,
  ],
  controllers: [
    StakingOptionController,
    StakingApplicationController,
    WithdrawalController,
    CustomerController,
    SettingController,
    EthUSDCConversionController,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: StakingOption.name, schema: StakingOptionSchema },
      { name: StakingApplication.name, schema: StakingApplicationSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Setting.name, schema: SettingSchema },
      { name: USDCLog.name, schema: USDCLogSchema },
      { name: EthUSDCConversion.name, schema: EthUSDCConversionSchema },
    ]),
    AuthenticationModule,
  ],
})
export class TodoModule {}
