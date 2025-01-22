import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class AddCurrencyDto {
  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  exchangeRateToUSD: number;
}
