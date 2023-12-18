import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CreateBillPaypalych {
  amount: number;
  order_id?: string;
  shop_id: string;
  currency_in: 'USD' | 'RUB' | 'EUR';
  email: string;
}
interface PaypalychResponseDTO {
  success: boolean;
  link_url: string;
  link_page_url: string;
  bill_id: string;
}

interface PaypalychBillInfo {
  id: string;
  status: 'NEW' | 'PROCESS' | 'UNDERPAID' | 'SUCCESS' | 'OVERPAID' | 'FAIL';
  type: string;
  amount: number;
  currency_in: 'USD' | 'RUB' | 'EUR';
  created_at: string;
  success: boolean;
}

@Injectable()
export class PaypalychService {
  private instancePayment;
  constructor(private readonly configService: ConfigService) {
    this.instancePayment = axios.create({
      baseURL: this.configService.get('PAYPALYCH_API_URL'),
      headers: {
        Authorization: `Bearer ${this.configService.get('PAYPALYCH_TOKEN')}`,
      },
    });
  }
  async createBillPaypalych(
    dto: CreateBillPaypalych,
  ): Promise<PaypalychResponseDTO> {
    return (await this.instancePayment.post('/bill/create', dto)).data;
  }

  async getPaypalychBillInfo(tx_id: string): Promise<PaypalychBillInfo> {
    return (await this.instancePayment.get(`/bill/status?id=${tx_id}`)).data;
  }
}
