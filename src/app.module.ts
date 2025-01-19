import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurrencyService } from './currency/currency.service';
import { CurrencyController } from './currency/currency.controller';

@Module({
  imports: [],
  controllers: [AppController, CurrencyController],
  providers: [AppService, CurrencyService],
})
export class AppModule {}
