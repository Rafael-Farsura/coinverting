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
    try {
      const result = await this.currencyService.convert(from, to, amount);

      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('add')
  async addCurrency(@Body() body: { currency: string; exchangeRate: number }) {
    try {
      await this.currencyService.addCurrency(body.currency, body.exchangeRate);

      return { message: `${body.currency} added successfully` };
    } catch (error) {
      return { message: error.message };
    }
  }

  @Delete('remove')
  async removeCurrency(@Body() body: { currency: string }) {
    try {
      this.currencyService.removeCurrency(body.currency);

      return { message: `${body.currency} removed successfully` };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('')
  async getSupportedCurrencies() {
    return this.currencyService.getSupportedCurrencies();
  }
}
