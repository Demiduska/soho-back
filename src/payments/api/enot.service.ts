import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CreateBillEnot {
  amount: number;
  order_id: string;
  shop_id: string;
  currency: 'RUB' | 'USD' | 'EUR' | 'UAH';
}
interface EnotResponseDTO {
  data: {
    id: string;
    amount: number;
    currency: 'RUB' | 'USD' | 'EUR' | 'UAH';
    url: string;
    expired: string;
  };
  status: number;
  status_check: boolean;
}

interface EnotBillInfo {
  data: {
    invoice_id: string;
    order_id: string;
    shop_id: string;
    status: 'created' | 'success' | 'fail' | 'expired ';
  };
  status: number;
  status_check: boolean;
}

@Injectable()
export class EnotService {
  private instancePayment;
  constructor(private readonly configService: ConfigService) {
    this.instancePayment = axios.create({
      baseURL: this.configService.get('ENOT_API_URL'),
      headers: {
        'x-api-key': `${this.configService.get('ENOT_SECRET_KEY')}`,
      },
    });
  }

  async createBillEnot(dto: CreateBillEnot): Promise<EnotResponseDTO> {
    return (await this.instancePayment.post('/create', dto)).data;
  }

  async getEnotBillInfo(tx_id: string): Promise<EnotBillInfo> {
    return (
      await this.instancePayment.get(
        `/info?invoice_id=${tx_id}&shop_id=${this.configService.get(
          'ENOT_SHOP_ID',
        )}`,
      )
    ).data;
  }
}
