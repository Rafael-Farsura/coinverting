import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('convert')
  async convert(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('amount') amount: number,
  ) {
    return this.currencyService.convert(from, to, amount);
  }

  @Post('add')
  async addCurrency(@Body('currency') currency: string) {
    this.currencyService.addCurrency(currency);

    return { message: `${currency} added successfully` };
  }

  @Delete('remove')
  async removeCurrency(@Body('currency') currency: string) {
    this.currencyService.removeCurrency(currency);

    return { message: `${currency} removed successfully` };
  }

  @Get('')
  async getSupportedCurrencies() {
    return this.currencyService.getSupportedCurrencies();
  }
}
