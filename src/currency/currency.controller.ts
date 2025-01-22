import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { ConvertCurrencyDto } from './dto/convertCurrency.dto';
import { AddCurrencyDto } from './dto/addCurrency.dto';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('convert')
  async convert(@Query() query: ConvertCurrencyDto) {
    try {
      const result = await this.currencyService.convert(query);

      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('add')
  async addCurrency(@Body() body: AddCurrencyDto) {
    try {
      await this.currencyService.addCurrency(body);

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
