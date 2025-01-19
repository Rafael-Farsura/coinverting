import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CurrencyService {
  private readonly baseApiUrl = 'https://economia.awesomeapi.com.br/json/last';

  async convert(from: string, to: string) {
    try {
      const response = await axios.get(`${this.baseApiUrl}/${from}-${to}`);
      return response.data;
    } catch (error) {
      throw new Error('Trouble fetching currency price');
    }
  }
}
