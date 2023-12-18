import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CreateBillPrime {
  action: 'initPayment';
  project: string;
  sum: number;
  currency: 'USD' | 'RUB' | 'EUR' | 'UAH';
  innerID: string;
  email: string;
  sign: any;
}
interface PrimeResponseDTO {
  status: 'OK';
  result: string;
  order_id: number;
}

interface GetPrimeBillDto {
  action: 'getOrderInfo';
  project: string;
  orderID: string;
  sign: any;
}

interface PrimeBillInfo {
  status: string;
  result: {
    order_id: string;
    date_add: string;
    sum: string;
    payWay: string;
    payed_from: string;
    innerID: string;
    pay_status: '0' | '1' | '2' | '3' | '-2' | '-1';
    webmaster_profit: string;
  };
}

@Injectable()
export class PrimeService {
  private instancePayment;
  constructor(private readonly configService: ConfigService) {
    this.instancePayment = axios.create({
      baseURL: this.configService.get('PRIME_API_URL'),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
  async createBillPrime(dto: CreateBillPrime): Promise<PrimeResponseDTO> {
    return (await this.instancePayment.post('', dto)).data;
  }

  async getPrimeBillInfo(dto: GetPrimeBillDto): Promise<PrimeBillInfo> {
    return (await this.instancePayment.post('', dto)).data;
  }
}
