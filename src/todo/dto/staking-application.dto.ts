export class StakingApplicationDto {
  created_at: Date;
  ending_at: number;
  wallet: string;
  amount: number;
  staking_option: string;
}

export class CreateStakingApplicationDto extends StakingApplicationDto {}
export class UpdateStakingApplicationDto extends StakingApplicationDto {}
