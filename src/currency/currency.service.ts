import { BadRequestException, Injectable } from '@nestjs/common';
import { ConvertCurrencyDto } from './dto/convertCurrency.dto';
import { AddCurrencyDto } from './dto/addCurrency.dto';

import axios from 'axios';

@Injectable()
export class CurrencyService {
  private readonly baseApiUrl = 'https://economia.awesomeapi.com.br/json/last';

  private supportedCurrencies = ['USD', 'BRL', 'EUR', 'BTC', 'ETH'];
  private fictionalExchangeRates: { [key: string]: number } = {};

  private async fetchExchangeRateUSD(currency: string) {
    const response = await axios.get(`${this.baseApiUrl}/${currency}-USD`);

    return response.data[`${currency}USD`]?.ask;
  }

  private async getValueInUSD(currency: string): Promise<number> {
    this.validateCurrency(currency);

    if (currency === 'USD') return 1;

    return this.supportedCurrencies.includes(currency)
      ? this.fetchExchangeRateUSD(currency)
      : this.fictionalExchangeRates[currency];
  }

  private isCurrencySupported(currency: string): boolean {
    return (
      this.supportedCurrencies.includes(currency) ||
      this.fictionalExchangeRates[currency] !== undefined
    );
  }

  private validateCurrency(currency: string): boolean {
    if (this.isCurrencySupported(currency)) return true;

    throw new BadRequestException(`The currency ${currency} is not valid`);
  }

  async convert(convertCurrencyDto: ConvertCurrencyDto) {
    const { from, to, amount } = convertCurrencyDto;

    const currencyFromInUSD = await this.getValueInUSD(from);
    const currencyToInUSD = await this.getValueInUSD(to);

    const convertedAmount = (currencyFromInUSD / currencyToInUSD) * amount;

    return {
      from,
      to,
      amount,
      convertedAmount: convertedAmount,
      exchangeRate: currencyFromInUSD / currencyToInUSD,
    };
  }

  addCurrency(addCurrencyDto: AddCurrencyDto): string {
    const { currency, exchangeRateToUSD } = addCurrencyDto;
    if (this.isCurrencySupported(currency))
      throw new Error('Currency already supported');

    this.fictionalExchangeRates[currency] = exchangeRateToUSD;

    return `${currency} was added successfully`;
  }

  removeCurrency(currency: string): string {
    this.validateCurrency(currency);

    delete this.fictionalExchangeRates[currency];

    return `${currency} deleted successfully`;
  }

  getSupportedCurrencies() {
    return [
      ...this.supportedCurrencies,
      '------ FICTIONALS  :',
      ...Object.keys(this.fictionalExchangeRates),
    ];
  }
}
