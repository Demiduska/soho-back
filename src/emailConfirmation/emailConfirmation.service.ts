import {
  BadRequestException,
  Injectable,
  SerializeOptions,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import VerificationTokenPayload from './verificationTokenPayload';
import { templateToString } from '../utils/templateToString';
import * as path from 'path';

@Injectable()
export class EmailConfirmationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  sendVerificationLink(email: string) {
    const payload: VerificationTokenPayload = { email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    const url = `${this.configService.get(
      'EMAIL_CONFIRMATION_URL',
    )}?token=${token}`;

    const replacements = {
      headerText: 'Регистрация аккаунта',
      url: url,
      buttonText: 'Подвердить регистрацию',
    };

    const filePath = path.join(
      __dirname,
      '../email/templates/confirmation.hbs',
    );

    return this.emailService.sendMail({
      from: this.configService.get('EMAIL_USER'),
      to: email,
      subject: 'Email confirmation',
      html: templateToString(filePath, replacements),
      attachments: [
        {
          filename: 'logo.png',
          path: this.configService.get('PUBLIC_STATIC_FILE_URL') + '/logo.png',
          cid: 'logo',
        },
        {
          filename: 'done.png',
          path: this.configService.get('PUBLIC_STATIC_FILE_URL') + '/done.png',
          cid: 'done',
        },
        {
          filename: 'vk.png',
          path: this.configService.get('PUBLIC_STATIC_FILE_URL') + '/vk.png',
          cid: 'vk',
        },
        {
          filename: 'tg.png',
          path: this.configService.get('PUBLIC_STATIC_FILE_URL') + '/tg.png',
          cid: 'tg',
        },
        {
          filename: 'dc.png',
          path: this.configService.get('PUBLIC_STATIC_FILE_URL') + '/dc.png',
          cid: 'dc',
        },
      ],
    });
  }

  sentNewUserInfo(email: string, login: string, password: string) {
    const replacements = {
      headerText: 'User Info',
      login: login,
      password: password,
    };
    const filePath = path.join(__dirname, '../email/templates/new-user.hbs');

    return this.emailService.sendMail({
      from: this.configService.get('EMAIL_USER'),
      to: email,
      subject: 'User Info',
      html: templateToString(filePath, replacements),
      attachments: [
        {
          filename: 'back.png',
          path: this.configService.get('PUBLIC_STATIC_FILE_URL') + '/back.png',
          cid: 'back',
        },
      ],
    });
  }

  sendResetPasswordLink(email: string, form: string) {
    const payload: VerificationTokenPayload = { email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_RESET_PASSWORD_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_RESET_PASSWORD_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    const url = `${this.configService.get(
      'RESET_PASSWORD_URL',
    )}?token=${token}&form=${form}`;

    const replacements = {
      headerText: 'Set new password',
      url: url,
      buttonText: 'Set new password',
    };

    const filePath = path.join(
      __dirname,
      '../email/templates/reset-password.hbs',
    );

    return this.emailService.sendMail({
      from: this.configService.get('EMAIL_USER'),
      to: email,
      subject: 'Reset password',
      html: templateToString(filePath, replacements),
      attachments: [
        {
          filename: 'back.png',
          path: this.configService.get('PUBLIC_STATIC_FILE_URL') + '/back.png',
          cid: 'back',
        },
      ],
    });
  }

  async confirmEmail(email: string) {
    const user = await this.usersService.getByEmail(email);
    if (user.isEmailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }
    await this.usersService.markEmailAsConfirmed(email);
  }

  async decodeConfirmationToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      });

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }

  public async resendConfirmationLink(userId: number) {
    const user = await this.usersService.getById(userId);
    if (user.isEmailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }
    await this.sendVerificationLink(user.email);
  }
}
