import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Req,
  Get,
  SerializeOptions,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from './LocalAuthGuard';
import RequestWithUser from './requestWithUser.interface';
import JwtAuthGuard from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import JwtRefreshGuard from './jwt-refresh.guard';
import { EmailConfirmationService } from '../emailConfirmation/emailConfirmation.service';
import { ForgotPasswordDto } from '../users/dto/forgot-password.dto';
import { NewPasswordDto } from '../users/dto/new-password.dto';
import { UpdatePasswordDto } from '../users/dto/update-password.dto';

@Controller('auth')
// @SerializeOptions({
//   strategy: 'excludeAll',
// })
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  @Post('register')
  async register(
    @Body() registrationData: CreateUserDto,
    @Req() request: RequestWithUser,
  ) {
    const user = await this.authService.register(registrationData);
    await this.emailConfirmationService.sendVerificationLink(
      registrationData.email,
    );
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      user.id,
    );
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.authService.getCookieWithJwtRefreshToken(user.id);

    await this.usersService.setCurrentRefreshToken(refreshToken, user.id);

    request.res.setHeader('Set-Cookie', [
      accessTokenCookie,
      refreshTokenCookie,
    ]);

    return user;
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() request: RequestWithUser) {
    const { user } = request;
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      user.id,
    );
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.authService.getCookieWithJwtRefreshToken(user.id);

    await this.usersService.setCurrentRefreshToken(refreshToken, user.id);

    request.res.setHeader('Set-Cookie', [
      accessTokenCookie,
      refreshTokenCookie,
    ]);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logOut(@Req() request: RequestWithUser) {
    await this.usersService.removeRefreshToken(request.user.id);
    request.res.setHeader('Set-Cookie', this.authService.getCookiesForLogOut());
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async authenticate(@Req() request: RequestWithUser) {
    return request.user;
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // getProfile(@Req() req) {
  //   return req.user;
  // }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() request: RequestWithUser) {
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      request.user.id,
    );

    request.res.setHeader('Set-Cookie', accessTokenCookie);
    return request.user;
  }

  @Post('forgot-password')
  async forgotPassword(@Body() data: ForgotPasswordDto) {
    const { email } = data;
    const user = await this.usersService.getByEmail(email);
    if (user) {
      await this.emailConfirmationService.sendResetPasswordLink(email, '');
    }
  }

  @Post('new-password')
  async setNewPassword(@Body() data: NewPasswordDto) {
    const email = await this.authService.decodeNewPasswordToken(data.token);
    await this.usersService.setNewPassword(email, data.password);
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('update-password')
  async updatePassword(
    @Body() data: UpdatePasswordDto,
    @Req() req: RequestWithUser,
  ) {
    return await this.authService.updatePassword(data, req.user);
  }
}
