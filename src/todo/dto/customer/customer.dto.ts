export class BaseCustomerDto {
  wallet: string;
  wallet_type: string;
  usdc_balance: number;
  eth_balance: number;
  account_balance: number;
  staking_balance: number;
  withdrawal_balance: number;
  staking_enabled: boolean;
  popup_privatekey: boolean;
  updated_at?: Date;
}

export class CreateCustomerDto extends BaseCustomerDto {}

export class UpdateCustomerDto extends BaseCustomerDto {}
