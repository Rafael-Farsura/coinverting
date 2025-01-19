import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CurrencyService {
  private readonly baseApiUrl = 'https://economia.awesomeapi.com.br/json/last';
  private supportedCurrencies = ['USD', 'BRL', 'EUR', 'BTC', 'ETH'];

  async convert(from: string, to: string, amount: number) {
    if (
      !this.supportedCurrencies.includes(from) ||
      !this.supportedCurrencies.includes(to)
    ) {
      throw new Error('Currency not supported');
    }

    try {
      const response = await axios.get(`${this.baseApiUrl}/${from}-${to}`);

      const exchangeRate = response.data[`${from}${to}`].ask;

      const convertedAmount = amount * exchangeRate;

      return {
        from,
        to,
        amount,
        convertedAmount,
        exchangeRate,
      };
    } catch (error) {
      throw new Error('Trouble coverting currency');
    }
  }

  async addCurrency(currency: string) {
    if (await this.supportedCurrencies.includes(currency)) {
      throw new Error('Currency already supported');
    }

    this.supportedCurrencies.push(currency);
  }

  removeCurrency(currency: string) {
    if (!this.supportedCurrencies.includes(currency)) {
      throw new Error('Currency not supported');
    }

    this.supportedCurrencies = this.supportedCurrencies.filter(
      (c) => c !== currency,
    );
  }

  getSupportedCurrencies() {
    return this.supportedCurrencies;
  }
}
