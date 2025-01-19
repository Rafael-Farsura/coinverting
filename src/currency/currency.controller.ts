import { Controller, Get, Param } from '@nestjs/common';
import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get(':from/:target')
  async getPrice(@Param('from') from: string, @Param('target') target) {
    return this.currencyService.getCurrencyPrice(from, target);
  }
}
