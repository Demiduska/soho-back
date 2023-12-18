import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CreateInvoiceCryptoCloud {
  order_id?: string;
  shop_id: string;
  amount: number;
  currency: 'USD' | 'RUB' | 'EUR' | 'GBP';
  email: string;
}

interface CryptoCloudResponseDTO {
  status: CryptoCloudResponseStatus;
  pay_url: string;
  invoice_id: string;
  currency: 'BTC' | 'LTC' | 'ETH' | 'USDT';
}

interface CryptoCloudInvoiceInfo {
  status: 'success' | 'error';
  status_invoice: 'created' | 'paid' | 'partial' | 'canceled';
}

enum CryptoCloudResponseStatus {
  success = 'success',
  error = 'error',
}

@Injectable()
export class CryptoCloudService {
  private instancePayment;
  constructor(private readonly configService: ConfigService) {
    this.instancePayment = axios.create({
      baseURL: this.configService.get('CRYPTOCLOUD_API_URL'),
      headers: {
        Authorization: `Token ${this.configService.get('CRYPTOCLOUD_TOKEN')}`,
      },
    });
  }

  async createInvoiceCryptoCloud(
    dto: CreateInvoiceCryptoCloud,
  ): Promise<CryptoCloudResponseDTO> {
    return (await this.instancePayment.post('/create', dto)).data;
  }

  async getCryptoCloudInvoiceInfo(
    tx_id: string,
  ): Promise<CryptoCloudInvoiceInfo> {
    return (await this.instancePayment.get(`/info?uuid=${tx_id}`)).data;
  }
}
