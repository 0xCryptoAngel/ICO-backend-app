export class StakingOptionDto {
  startAmount: number;
  endAmount: number;
  starkingReward: Array<{
    duration: number;
    minRewardRate: number;
    maxRewardRate: number;
  }>;
  descriptions: Array<string>;
}

export class CreateStakingOptionDto extends StakingOptionDto {}

export class UpdateStakingOptionDto extends StakingOptionDto {}
