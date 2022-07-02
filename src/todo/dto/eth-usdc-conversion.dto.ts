export class BaseEthUSDCConversionDto {
  wallet: string;
  usdc_amount: number;
  eth_amount: number;
  created_at: Date;
}

export class CreateEthUSDCConversionDto extends BaseEthUSDCConversionDto {}

export class UpdateEthUSDCConversionDto extends BaseEthUSDCConversionDto {}
