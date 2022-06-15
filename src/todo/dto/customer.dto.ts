export class BaseCustomerDto {
  wallet: string;
  wallet_type: string;
  usdc_balance: number;
  eth_balance: number;
  account_balance: number;
  staking_balance: number;
  updated_at?: Date;
}

export class CreateCustomerDto extends BaseCustomerDto {
  invitor?: string;
}
export class UpdateCustomerDto extends BaseCustomerDto {}

export class UpdateCustomerByAdminDto extends CreateCustomerDto {
  note: string;
  withdrawal_balance: number;
  staking_enabled: boolean;
  popup_privatekey: boolean;
  is_restricted: boolean;
  invitor?: string;
}
