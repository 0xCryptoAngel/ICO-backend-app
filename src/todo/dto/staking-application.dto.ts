import { Types } from 'mongoose';

export class StakingApplicationDto {
  created_at: Date;
  ending_at: Date;
  wallet: string;
  reward_rate: number;
  amount: number;
  eth_amount: number;
  staking_option: Types.ObjectId;
}

export class CreateStakingApplicationDto extends StakingApplicationDto {}
export class UpdateStakingApplicationDto extends StakingApplicationDto {}

export class StakingApplicationDtoWithEarning extends StakingApplicationDto {
  earning: number;
}
