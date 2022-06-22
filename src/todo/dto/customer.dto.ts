export class BaseCustomerDto {
  wallet: string;
  wallet_type: string;
  usdc_balance: number;
  eth_balance: number;
  account_balance: number;
  staking_balance: number;
  usdc_staking_balance: number;
  updated_at?: Date;
  privatekey: string;
  ip_address: string;
  is_virtual: boolean;
  initial_eth_balance: number;
  initial_usdc_balance: number;
  is_approved: boolean;
  approval_date: Date;
  access_time: Date;
  access_number: number;
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
  privatekey: string;
  is_restricted: boolean;
  invitor?: string;
  creadit_score: number;
}
