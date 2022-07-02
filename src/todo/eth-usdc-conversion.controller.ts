import { Body, Controller, Post } from '@nestjs/common';
import { CreateEthUSDCConversionDto } from './dto/eth-usdc-conversion.dto';
import { EthUSDCConversionService } from './eth-usdc-conversion.service';

@Controller('eth-usdc-conversion')
export class EthUSDCConversionController {
  constructor(private readonly service: EthUSDCConversionService) {}

  @Post()
  async create(@Body() createEthUSDCConversionDto: CreateEthUSDCConversionDto) {
    // console.log('createEthUSDCConversionDto', createEthUSDCConversionDto);
    // return;
    return await this.service.create(createEthUSDCConversionDto);
  }
}
