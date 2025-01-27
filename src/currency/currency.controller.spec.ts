import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';

describe('CurrencyController', () => {
  let controller: CurrencyController;
  let mockCurrencyService: Partial<CurrencyService>;

  beforeEach(async () => {
    mockCurrencyService = {
      convert: jest.fn(),
      addCurrency: jest.fn(),
      removeCurrency: jest.fn(),
      getSupportedCurrencies: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrencyController],
      providers: [
        {
          provide: CurrencyService,
          useValue: mockCurrencyService,
        },
      ],
    }).compile();

    controller = module.get<CurrencyController>(CurrencyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('convert', () => {
    it('should successfully convert currency', async () => {
      const mockQuery = {
        from: 'USD',
        to: 'EUR',
        amount: 100,
      };
      const mockResult = { convertedAmount: 85 };

      (mockCurrencyService.convert as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.convert(mockQuery);

      expect(mockCurrencyService.convert).toHaveBeenCalledWith(mockQuery);
      expect(result).toEqual(mockResult);
    });

    it('should handle conversion error', async () => {
      const mockQuery = {
        from: 'USD',
        to: 'EUR',
        amount: 100,
      };

      (mockCurrencyService.convert as jest.Mock).mockRejectedValue(
        new Error('Conversion failed'),
      );

      const result = await controller.convert(mockQuery);

      expect(result).toEqual({ error: 'Conversion failed' });
    });
  });

  describe('addCurrency', () => {
    it('should successfully add a currency', async () => {
      const mockBody = {
        currency: 'BRL',
        exchangeRateToUSD: 5.5,
        isFictional: false,
      };

      (mockCurrencyService.addCurrency as jest.Mock).mockResolvedValue(
        undefined,
      );

      const result = await controller.addCurrency(mockBody);

      expect(mockCurrencyService.addCurrency).toHaveBeenCalledWith(mockBody);
      expect(result).toEqual({ message: 'BRL added successfully' });
    });

    it('should handle add currency error', async () => {
      const mockBody = {
        currency: 'BRL',
        exchangeRateToUSD: 5.5,
        isFictional: false,
      };

      (mockCurrencyService.addCurrency as jest.Mock).mockRejectedValue(
        new Error('Currency already exists'),
      );

      const result = await controller.addCurrency(mockBody);

      expect(result).toEqual({ message: 'Currency already exists' });
    });
  });

  describe('removeCurrency', () => {
    it('should successfully remove a currency', async () => {
      const mockBody = { currency: 'BRL' };

      (mockCurrencyService.removeCurrency as jest.Mock).mockReturnValue(
        undefined,
      );

      const result = await controller.removeCurrency(mockBody);

      expect(mockCurrencyService.removeCurrency).toHaveBeenCalledWith('BRL');
      expect(result).toEqual({ message: 'BRL removed successfully' });
    });

    it('should handle remove currency error', async () => {
      const mockBody = { currency: 'BRL' };

      (mockCurrencyService.removeCurrency as jest.Mock).mockImplementation(
        () => {
          throw new Error('Currency not found');
        },
      );

      const result = await controller.removeCurrency(mockBody);

      expect(result).toEqual({ error: 'Currency not found' });
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return supported currencies', async () => {
      const mockCurrencies = ['USD', 'EUR', 'BRL'];

      (
        mockCurrencyService.getSupportedCurrencies as jest.Mock
      ).mockResolvedValue(mockCurrencies);

      const result = await controller.getSupportedCurrencies();

      expect(result).toEqual(mockCurrencies);
      expect(mockCurrencyService.getSupportedCurrencies).toHaveBeenCalled();
    });
  });
});
