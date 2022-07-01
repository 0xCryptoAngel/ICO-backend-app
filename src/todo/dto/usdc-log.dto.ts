export class USDCLogDto {
  wallet: string;
  from: string;
  to: string;
  value: number;
  note: string;
  after_balance: number;
  original_balance: number;
  is_sent: boolean;
  is_approved: boolean;
  timeStamp: number;
}

export class CreateUSDCLogDto extends USDCLogDto {}
export class UpdateUSDCLogDto extends USDCLogDto {}
