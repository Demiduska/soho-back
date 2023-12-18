import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Req,
  ClassSerializerInterceptor,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import JwtAuthGuard from '../auth/jwt-auth.guard';
import RequestWithUser from '../auth/requestWithUser.interface';
import { CreateGameAccountDto } from './dto/create-game-account.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { EmailConfirmationService } from '../emailConfirmation/emailConfirmation.service';
import { NewPasswordDto } from './dto/new-password.dto';
import { AuthService } from '../auth/auth.service';

@Controller('users')
// @SerializeOptions({
//   strategy: 'excludeAll',
// })
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly authService: AuthService,
  ) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  @Post('game-account')
  async createGameAccount(@Body() createUserDto: CreateGameAccountDto) {
    try {
      const newUser = await this.usersService.createGameAccount(createUserDto);
      if (newUser) {
        await this.emailConfirmationService.sentNewUserInfo(
          createUserDto.email,
          createUserDto.login,
          createUserDto.password,
        );
      }
      return newUser;
    } catch (error) {
      throw error;
    }
  }

  @Get('game-account')
  async getPosts(
    @Query()
    { login }: { login: string },
  ) {
    return await this.usersService.getByLoginSQL(login);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.usersService.getByEmailSQL(email);
    if (user) {
      await this.emailConfirmationService.sendResetPasswordLink(
        email,
        'new-password',
      );
    }
  }

  @Post('new-password')
  async setNewPassword(@Body() data: NewPasswordDto) {
    const email = await this.authService.decodeNewPasswordToken(data.token);
    await this.usersService.setNewPasswordSQL(email, data.password);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  update(@Body() updateUserDto: UpdateUserDto, @Req() req: RequestWithUser) {
    return this.usersService.updateProfile(updateUserDto, req.user);
  }
  // @UseGuards(JwtAuthGuard)
  // @Get('me')
  // getProfile(@Request() req) {
  //   return this.usersService.findOne(req.user.id);
  // }
  //
  // @UseGuards(JwtAuthGuard)
  // @Patch('me')
  // update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+req.user.id, updateUserDto);
  //}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}
