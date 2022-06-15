export class WithdrawalDto {
  wallet: string;
  amount: number;
  is_confirmed: boolean;
}

export class CreateWithdrawalDto extends WithdrawalDto {}
export class UpdateWithdrawalDto extends WithdrawalDto {}
