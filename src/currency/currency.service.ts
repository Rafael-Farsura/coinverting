import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CurrencyService {
  private readonly baseApiUrl = 'https://economia.awesomeapi.com.br/json/last'; /// it needs the param " /:coins  " at end,
  // like this: http://economia.awesomeapi.com.br/json/last/USD-BRL

  async getCurrencyPrice(from: string, to: string) {
    const response = await axios.get(`${this.baseApiUrl}/${from}-${to}`);
    return response.data;
  }
}
