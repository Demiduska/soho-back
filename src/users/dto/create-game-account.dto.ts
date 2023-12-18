import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateGameAccountDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  login: string;

  @IsString()
  @MinLength(4)
  @MaxLength(16)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Простой пароль',
  })
  password: string;
}
