export class WithdrawalDto {
  created_at: Date;
  wallet: string;
  amount: number;
  is_confirmed: boolean;
  is_checked: boolean;
}

export class CreateWithdrawalDto extends WithdrawalDto {}
export class UpdateWithdrawalDto extends WithdrawalDto {}
