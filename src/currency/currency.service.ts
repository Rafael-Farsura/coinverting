import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CurrencyService {
  private readonly baseApiUrl = 'https://economia.awesomeapi.com.br/json/last';
  private supportedCurrencies = ['USD', 'BRL', 'EUR', 'BTC', 'ETH'];
  private fictionalExchangeRates: { [key: string]: number } = {};

  async convert(from: string, to: string, amount: number) {
    from = from.toUpperCase();
    to = to.toUpperCase();

    if (
      !this.supportedCurrencies.includes(from) &&
      !this.isFictionalCurrency(from)
    ) {
      throw new Error(`Currency not supported: ${from}`);
    }

    if (
      !this.supportedCurrencies.includes(to) &&
      !this.isFictionalCurrency(to)
    ) {
      throw new Error(`Currency not supported: ${to}`);
    }

    try {
      if (
        this.supportedCurrencies.includes(from) &&
        this.supportedCurrencies.includes(to)
      ) {
        const response = await axios.get(`${this.baseApiUrl}/${from}-${to}`);

        const exchangeRate = response.data[`${from}${to}`]?.ask;

        if (!exchangeRate) {
          throw new Error(`Exchange rate not found for ${from} to ${to}`);
        }

        const convertedAmount = amount * exchangeRate;

        return {
          from,
          to,
          amount,
          convertedAmount,
          exchangeRate,
        };
      } else {
        return this.convertFictionalCurrency(from, to, amount);
      }
    } catch (error) {
      console.error('Error fetching currency price:', error.message);
      throw new Error('Trouble coverting currency');
    }
  }

  private isFictionalCurrency(currency: string): boolean {
    return this.fictionalExchangeRates[currency] !== undefined;
  }

  private convertFictionalCurrency(from: string, to: string, amount: number) {
    if (this.isFictionalCurrency(from) && this.isFictionalCurrency(to)) {
      const fromRate = this.fictionalExchangeRates[from];
      const toRate = this.fictionalExchangeRates[to];

      const convertedAmount = (amount * fromRate) / toRate;

      return {
        from,
        to,
        amount,
        convertedAmount,
        exchangeRate: toRate / fromRate,
      };
    } else if (this.isFictionalCurrency(from)) {
      const exchangeRate = this.fictionalExchangeRates[from];
      const convertedAmount = amount / exchangeRate;
      return {
        from,
        to,
        amount,
        convertedAmount,
        exchangeRate: exchangeRate,
      };
    } else if (this.isFictionalCurrency(to)) {
      const exchangeRate = this.fictionalExchangeRates[to];
      const convertedAmount = amount * exchangeRate;

      return {
        from,
        to,
        amount,
        convertedAmount,
        exchangeRate: 1 / exchangeRate,
      };
    }
  }

  addCurrency(currency: string, exchangeRate: number) {
    if (
      this.supportedCurrencies.includes(currency) ||
      this.fictionalExchangeRates[currency] !== undefined
    ) {
      throw new Error('Currency already supported');
    }

    this.fictionalExchangeRates[currency] = exchangeRate;
  }

  removeCurrency(currency: string) {
    if (
      !this.supportedCurrencies.includes(currency) &&
      !this.fictionalExchangeRates[currency]
    ) {
      throw new Error('Currency not supported');
    }

    delete this.fictionalExchangeRates[currency];

    return `${currency} deleted succesfull`;
  }

  getSupportedCurrencies() {
    return [
      ...this.supportedCurrencies,
      ...Object.keys(this.fictionalExchangeRates),
    ];
  }
}
