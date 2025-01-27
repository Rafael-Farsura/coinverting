import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyService } from './currency.service';
import { Repository } from 'typeorm';
import { Currency } from './entities/currency.entity';
import { BadRequestException } from '@nestjs/common';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let mockCurrencyRepository: Partial<Repository<Currency>>;

  beforeEach(async () => {
    mockCurrencyRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyService,
        {
          provide: 'CurrencyRepository',
          useValue: mockCurrencyRepository,
        },
      ],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);
  });

  describe('convert', () => {
    it('should convert currency correctly', async () => {
      jest
        .spyOn(service as any, 'getValueInUSD')
        .mockImplementation(async (currency) => {
          if (currency === 'USD') return 1;
          if (currency === 'EUR') return 0.85;
          if (currency === 'BRL') return 5;
          throw new Error('Currency not found');
        });

      const result = await service.convert({
        from: 'USD',
        to: 'EUR',
        amount: 100,
      });

      expect(result).toEqual({
        from: 'USD',
        to: 'EUR',
        amount: 100,
        convertedAmount: 117.64705882352942,
        exchangeRate: 1.1764705882352942,
      });
    });
  });

  describe('addCurrency', () => {
    it('should throw an error if currency already exists', async () => {
      mockCurrencyRepository.findOne = jest.fn().mockResolvedValue({});

      await expect(
        service.addCurrency({
          currency: 'XYZ',
          exchangeRateToUSD: 1.5,
          isFictional: false,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should add a fictional currency', async () => {
      mockCurrencyRepository.findOne = jest.fn().mockResolvedValue(null);

      jest.spyOn(service as any, 'isFictionalCurrency').mockResolvedValue(true);
      mockCurrencyRepository.create = jest.fn().mockReturnValue({
        code: 'XYZ',
        exchangeRateToUSD: 1.5,
        isFictional: true,
      });
      mockCurrencyRepository.save = jest.fn();

      jest.spyOn(service as any, 'validateCurrency').mockReturnValue(true);

      const result = await service.addCurrency({
        currency: 'XYZ',
        exchangeRateToUSD: 1.5,
        isFictional: true,
      });

      expect(result).toBe('XYZ was added successfully');
    });

    it('should add a non-fictional currency', async () => {
      mockCurrencyRepository.findOne = jest.fn().mockResolvedValue(null);

      jest
        .spyOn(service as any, 'isFictionalCurrency')
        .mockResolvedValue(false);
      jest.spyOn(service as any, 'fetchExchangeRateUSD').mockResolvedValue(1.2);
      mockCurrencyRepository.create = jest.fn().mockReturnValue({
        code: 'ABC',
        exchangeRateToUSD: 1.2,
        isFictional: false,
      });
      mockCurrencyRepository.save = jest.fn();

      jest.spyOn(service as any, 'validateCurrency').mockReturnValue(true);

      const result = await service.addCurrency({
        currency: 'ABC',
        isFictional: false,
        exchangeRateToUSD: 1.2,
      });

      expect(result).toBe('ABC was added successfully');
    });
  });

  describe('removeCurrency', () => {
    it('should remove a currency', async () => {
      jest.spyOn(service as any, 'validateCurrency').mockReturnValue(true);

      mockCurrencyRepository.delete = jest.fn();

      const result = await service.removeCurrency('USD');

      expect(result).toBe('USD deleted successfully');
      expect(mockCurrencyRepository.delete).toHaveBeenCalledWith({
        code: 'USD',
      });
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return list of currencies', async () => {
      const mockCurrencies = [
        { code: 'USD', exchangeRateToUSD: 1, isFictional: false },
        { code: 'EUR', exchangeRateToUSD: 0.85, isFictional: false },
      ];

      mockCurrencyRepository.find = jest.fn().mockResolvedValue(mockCurrencies);

      const result = await service.getSupportedCurrencies();

      expect(result).toEqual(mockCurrencies);
    });
  });
});
