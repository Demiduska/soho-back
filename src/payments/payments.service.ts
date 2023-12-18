import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntityPg } from './entities/payment.entity';
import { UsersService } from '../users/users.service';
import { BonusLevels } from './bonus-levels';
import { PaymentEntityMySQL } from './entities/mysql/payment.entity';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import Payment from './payment.enum';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus } from './payment-status.enum';
import { CryptoCloudService } from './api/cryptocloud.service';
import { PaypalychService } from './api/paypalych.service';
import { EnotService } from './api/enot.service';
import { PrimeService } from './api/prime.service';
//for dev 1
//import * as md5 from 'md5';
//for prod
import md5 from 'md5';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentEntityPg)
    private paymentsRepository: Repository<PaymentEntityPg>,

    @InjectRepository(PaymentEntityMySQL, 'mysqlConnection')
    private paymentSqlRepository: Repository<PaymentEntityMySQL>,
    private readonly cryptoCloudService: CryptoCloudService,
    private readonly paypalychService: PaypalychService,
    private readonly enotService: EnotService,
    private readonly primeService: PrimeService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}
  async create(createPaymentDto: CreatePaymentDto) {
    const user = await this.usersService.getByLoginSQL(createPaymentDto.login);
    let calculatedBonus = 0;
    for (const level of BonusLevels) {
      if (
        createPaymentDto.amount >= level.min &&
        createPaymentDto.amount < level.max
      ) {
        calculatedBonus = Math.round(createPaymentDto.amount * level.bonus); // round off to the nearest integer
        break;
      }
    }
    let invoice = null;
    let paymentLink = '';
    let transactionId = '';

    switch (createPaymentDto.payment) {
      case Payment.cryptocloud:
        invoice = await this.cryptoCloudService.createInvoiceCryptoCloud({
          shop_id: this.configService.get('CRYPTOCLOUD_SHOP_ID'),
          amount: createPaymentDto.amount,
          currency: 'USD',
          email: user.email,
        });
        if (invoice.status === 'success') {
          paymentLink = invoice.pay_url;
          transactionId = invoice.invoice_id;
        } else {
          throw new HttpException(
            'Error with payment',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        break;
      case Payment.paypalych:
        invoice = await this.paypalychService.createBillPaypalych({
          shop_id: this.configService.get('PAYPALYCH_SHOP_ID'),
          amount: createPaymentDto.amount,
          currency_in: 'USD',
          email: user.email,
        });
        if (invoice.success) {
          paymentLink = invoice.link_page_url;
          transactionId = invoice.bill_id;
        } else {
          throw new HttpException(
            'Error with payment',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        break;
      case Payment.enot:
        const newPaymentEnot = await this.paymentsRepository.create({
          ...createPaymentDto,
          login: user.login,
          user_id: user.id,
          email: user.email,
          bonus: calculatedBonus,
          total: calculatedBonus + createPaymentDto.amount,
        });
        await this.paymentsRepository.save(newPaymentEnot);
        invoice = await this.enotService.createBillEnot({
          shop_id: this.configService.get('ENOT_SHOP_ID'),
          amount: createPaymentDto.amount,
          currency: 'USD',
          order_id: newPaymentEnot.id.toString(),
        });

        if (invoice.status !== 200) {
          throw new HttpException(
            'Error with payment',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        newPaymentEnot.transaction_id = invoice.data.id;
        newPaymentEnot.payment_link = invoice.data.url;

        await this.paymentsRepository.save(newPaymentEnot);

        return newPaymentEnot;

      case Payment.prime:
        const newPaymentPrime = await this.paymentsRepository.create({
          ...createPaymentDto,
          login: user.login,
          user_id: user.id,
          email: user.email,
          bonus: calculatedBonus,
          total: calculatedBonus + createPaymentDto.amount,
        });
        await this.paymentsRepository.save(newPaymentPrime);

        const data = {
          action: 'initPayment',
          project: this.configService.get('PRIME_SHOP_ID'),
          sum: createPaymentDto.amount,
          currency: 'USD',
          innerID: newPaymentPrime.id.toString(),
          email: user.email,
        };

        invoice = await this.primeService.createBillPrime({
          action: 'initPayment',
          project: this.configService.get('PRIME_SHOP_ID'),
          sum: createPaymentDto.amount,
          currency: 'USD',
          innerID: newPaymentPrime.id.toString(),
          email: user.email,
          sign: md5(
            this.configService.get('PRIME_TOKEN') +
              data.action +
              data.project +
              data.sum +
              data.currency +
              data.innerID +
              data.email,
          ),
        });

        if (invoice.status !== 'OK') {
          throw new HttpException(
            'Error with payment',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        newPaymentPrime.transaction_id = invoice.order_id;
        newPaymentPrime.payment_link = invoice.result;

        await this.paymentsRepository.save(newPaymentPrime);

        return newPaymentPrime;

      default:
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }

    if (!transactionId || !paymentLink) {
      throw new HttpException(
        'Transaction ID is empty',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const newPayment = await this.paymentsRepository.create({
      ...createPaymentDto,
      login: user.login,
      user_id: user.id,
      email: user.email,
      bonus: calculatedBonus,
      total: calculatedBonus + createPaymentDto.amount,
      transaction_id: transactionId,
      payment_link: paymentLink,
    });
    await this.paymentsRepository.save(newPayment);
    return newPayment;
  }

  async getPaymentByTxId(tx_id: string) {
    const payment = await this.paymentsRepository.findOne({
      where: { transaction_id: tx_id },
    });
    if (payment) {
      return payment;
    } else {
      throw new HttpException(
        'Transaction  with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async confirmPayment(confirmPaymentDto: ConfirmPaymentDto) {
    const payment = await this.getPaymentByTxId(
      confirmPaymentDto.transaction_id,
    );
    try {
      let invoice = null;
      switch (confirmPaymentDto.payment) {
        case Payment.cryptocloud:
          invoice = await this.cryptoCloudService.getCryptoCloudInvoiceInfo(
            payment.transaction_id,
          );
          if (invoice.status_invoice === 'paid') {
            await this.paymentsRepository.update(payment.id, {
              status: PaymentStatus.PAID,
            });
          } else {
            throw new HttpException(
              'Error with payment',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
          break;
        case Payment.paypalych:
          invoice = await this.paypalychService.getPaypalychBillInfo(
            payment.transaction_id,
          );
          if (invoice.status === 'SUCCESS') {
            await this.paymentsRepository.update(payment.id, {
              status: PaymentStatus.PAID,
            });
          } else {
            throw new HttpException(
              'Error with payment',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
          break;
        case Payment.enot:
          invoice = await this.enotService.getEnotBillInfo(
            payment.transaction_id,
          );
          if (invoice.data.status === 'success') {
            await this.paymentsRepository.update(payment.id, {
              status: PaymentStatus.PAID,
            });
          } else {
            throw new HttpException(
              'Error with payment',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
          break;
        case Payment.prime:
          const data = {
            action: 'getOrderInfo',
            project: this.configService.get('PRIME_SHOP_ID'),
            orderID: payment.transaction_id,
          };
          invoice = await this.primeService.getPrimeBillInfo({
            action: 'getOrderInfo',
            project: data.project,
            orderID: data.orderID,
            sign: md5(
              this.configService.get('PRIME_TOKEN') +
                data.action +
                data.project +
                data.orderID,
            ),
          });
          if (invoice.result.pay_status === '1') {
            await this.paymentsRepository.update(payment.id, {
              status: PaymentStatus.PAID,
            });
          } else {
            throw new HttpException(
              'Error with payment',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
          break;
        default:
          throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      }
      if (!invoice) {
        throw new HttpException(
          'Invoice is empty',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const paymentGameServer = await this.paymentSqlRepository.create({
        account: payment.login,
        platform: payment.payment,
        transaction_id: payment.transaction_id,
        amount: payment.total,
        status: PaymentStatus.PAID,
      });
      await this.paymentSqlRepository.save(paymentGameServer);
      return paymentGameServer;
    } catch (e) {
      console.log(e);
    }
  }

  findAll() {
    return `This action returns all payments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
