import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConvertCurrencyDto } from './dto/convertCurrency.dto';
import { AddCurrencyDto } from './dto/addCurrency.dto';

import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Currency } from './entities/currency.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CurrencyService {
  private readonly baseApiUrl = 'https://economia.awesomeapi.com.br/json/last';

  private readonly supportedCurrencies = ['USD', 'BRL', 'EUR', 'BTC', 'ETH'];

  constructor(
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async onModuleInit() {
    await this.initializeSupportedCurrencies();
  }

  private async fetchExchangeRateUSD(currency: string): Promise<number> {
    if (currency === 'USD') return 1;

    try {
      const response = await axios.get(`${this.baseApiUrl}/${currency}-USD`);

      return response.data[`${currency}USD`]?.ask;
    } catch (error) {
      return 0;
    }
  }

  private async getValueInUSD(currency: string): Promise<number> {
    this.validateCurrency(currency);

    if (currency === 'USD') return 1;

    const cacheKey = `currency_usd_rate:${currency}`;
    const cachedRate = await this.cacheManager.get(cacheKey);

    if (cachedRate) return cachedRate as number;

    let currencyEntity: Currency = await this.currencyRepository.findOne({
      where: { code: currency },
    });

    if (!currencyEntity) {
      const realCurrencyInUSD = await this.fetchExchangeRateUSD(currency);

      if (!realCurrencyInUSD)
        throw new BadRequestException(`'Currency : ${currency} not found'`);

      currencyEntity = this.currencyRepository.create({
        code: currency,
        exchangeRateToUSD: realCurrencyInUSD,
        isFictional: false,
      });

      await this.currencyRepository.save(currencyEntity);
    }

    await this.cacheManager.set(
      cacheKey,
      currencyEntity.exchangeRateToUSD,
      3600,
    );

    return currencyEntity.exchangeRateToUSD;
  }

  private isCurrencySupported(currency: string): boolean {
    return this.currencyRepository.findOne({ where: { code: currency } })
      ? true
      : false;
  }

  private validateCurrency(currency: string): boolean {
    if (this.isCurrencySupported(currency)) return true;

    throw new BadRequestException(`The currency ${currency} is not valid`);
  }

  private async isFictionalCurrency(currency: string): Promise<boolean> {
    const currencyInUSD = await this.fetchExchangeRateUSD(currency);

    if (!currencyInUSD) return true;

    return false;
  }

  async convert(convertCurrencyDto: ConvertCurrencyDto) {
    const { from, to, amount } = convertCurrencyDto;

    const [currencyFromInUSD, currencyToInUSD] = await Promise.all([
      this.getValueInUSD(from),
      this.getValueInUSD(to),
    ]);

    const convertedAmount = (currencyFromInUSD / currencyToInUSD) * amount;

    return {
      from,
      to,
      amount,
      convertedAmount: convertedAmount,
      exchangeRate: currencyFromInUSD / currencyToInUSD,
    };
  }

  async addCurrency(addCurrencyDto: AddCurrencyDto): Promise<string> {
    const currency = addCurrencyDto.currency;
    let isFictional = addCurrencyDto.isFictional;
    let exchangeRateToUSD = addCurrencyDto.exchangeRateToUSD;
    if (
      await this.currencyRepository.findOne({
        where: {
          code: currency,
        },
      })
    )
      throw new BadRequestException('Currency already supported');

    isFictional = await this.isFictionalCurrency(currency);

    if (!isFictional)
      exchangeRateToUSD = await this.fetchExchangeRateUSD(currency);

    const currencyEntity: Currency = await this.currencyRepository.create({
      code: currency,
      exchangeRateToUSD: exchangeRateToUSD,
      isFictional: isFictional,
    });

    this.validateCurrency(currencyEntity.code);

    await this.currencyRepository.save(currencyEntity);

    return `${currency} was added successfully`;
  }

  async removeCurrency(currency: string): Promise<string> {
    this.validateCurrency(currency);

    await this.currencyRepository.delete({ code: currency });

    return `${currency} deleted successfully`;
  }

  async getSupportedCurrencies() {
    return await this.currencyRepository.find();
  }

  private async initializeSupportedCurrencies() {
    for (const currency of this.supportedCurrencies) {
      const existingCurrency = await this.currencyRepository.findOne({
        where: { code: currency },
      });

      if (!existingCurrency) {
        const currencyInUSD = await this.fetchExchangeRateUSD(currency);

        if (currencyInUSD) {
          const currencyEntity = await this.currencyRepository.create({
            code: currency,
            exchangeRateToUSD: currencyInUSD,
            isFictional: false,
          });

          await this.currencyRepository.save(currencyEntity);
        }
      }
    }
  }
}
