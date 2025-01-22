import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class ConvertCurrencyDto {
  @IsNotEmpty()
  @IsString()
  from: string;

  @IsNotEmpty()
  @IsString()
  to: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;
}
