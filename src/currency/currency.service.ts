import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CurrencyService {
  private readonly baseApiUrl = 'https://economia.awesomeapi.com.br/json/last';
  private supportedCurrencies = ['USD', 'BRL', 'EUR', 'BTC', 'ETH'];

  async convert(from: string, to: string, amount: number) {
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
    // Adicione lógica para verificar se a moeda é fictícia
    return currency.startsWith('HURB'); // Exemplo: todas as moedas que começam com HURB  fictícias
  }

  private convertFictionalCurrency(from: string, to: string, amount: number) {
    // Lógica fictícia de conversão (exemplo)
    const fictionalExchangeRates = {
      HURB: 0.1, // Exemplo: 1 HURB = 0.1 USD
    };

    if (this.isFictionalCurrency(from) && this.isFictionalCurrency(to)) {
      return {
        from,
        to,
        amount,
        convertedAmount: amount,
        exchangeRate: 1,
      };
    } else if (this.isFictionalCurrency(from)) {
      // Conversão de moeda fictícia para moeda real
      const exchangeRate = fictionalExchangeRates[from];

      return {
        from,
        to,
        amount,
        convertedAmount: amount * exchangeRate,
        exchangeRate,
      };
    } else if (this.isFictionalCurrency(to)) {
      // Conversão de moeda real para moeda fictícia
      const exchangeRate = 1 / fictionalExchangeRates[to];

      return {
        from,
        to,
        amount,
        convertedAmount: amount * exchangeRate,
        exchangeRate,
      };
    }
  }

  addCurrency(currency: string) {
    if (this.supportedCurrencies.includes(currency)) {
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
