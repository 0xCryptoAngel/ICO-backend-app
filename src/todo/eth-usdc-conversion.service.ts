import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEthUSDCConversionDto } from './dto/eth-usdc-conversion.dto';
import {
  EthUSDCConversion,
  EthUSDCConversionDocument,
} from './schemas/eth-usdc-conversion.schema';

@Injectable()
export class EthUSDCConversionService {
  constructor(
    @InjectModel(EthUSDCConversion.name)
    private readonly model: Model<EthUSDCConversionDocument>,
  ) {}

  async create(
    createEthUSDCConversionDto: CreateEthUSDCConversionDto,
  ): Promise<EthUSDCConversion> {
    console.log('createEthUSDCConversionDto', createEthUSDCConversionDto);
    return await new this.model(createEthUSDCConversionDto).save();
  }
}
