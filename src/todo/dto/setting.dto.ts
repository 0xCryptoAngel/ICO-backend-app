export class BaseSettingDto {
  contract_address: string;
  usdc_vault: string;
  invitation_bonus_percentages: Array<number>;
  last_checked?: Date;
}

export class CreateSettingDto extends BaseSettingDto {}

export class UpdateSettingDto extends BaseSettingDto {}
