export class BaseSettingDto {
  contract_address: string;
  usdc_vault: string;
  invitation_bonus_percentages: Array<number>;
}

export class CreateSettingDto extends BaseSettingDto {}

export class UpdateSettingDto extends BaseSettingDto {}
