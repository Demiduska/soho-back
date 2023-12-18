import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { UserEntityPg } from './entities/pg/user.entity';
import * as bcrypt from 'bcrypt';
import UserNotFoundException from './exceptions/userNotFound.exception';
import Role from '../roles/role.enum';
import { PostgresErrorCode } from '../database/postgresErrorCodes.enum';
import { CreateGameAccountDto } from './dto/create-game-account.dto';
import { UserEntitySql } from './entities/mysql/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntityPg)
    private usersRepository: Repository<UserEntityPg>,

    @InjectRepository(UserEntitySql, 'mysqlConnection')
    private userSqlRepository: Repository<UserEntitySql>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const newUser = await this.usersRepository.create(createUserDto);
    await this.usersRepository.save(newUser);
    return newUser;
  }

  async createGameAccount(createGameAccountDto: CreateGameAccountDto) {
    const hashedPassword = await bcrypt.hash(createGameAccountDto.password, 10);
    try {
      const newUser = await this.userSqlRepository.create({
        ...createGameAccountDto,
        login: createGameAccountDto.login.toLowerCase(),
        password: hashedPassword,
      });
      await this.userSqlRepository.save(newUser);
      return newUser;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('Duplicate entry')) {
          throw new HttpException(
            'The user already exists.',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      throw error;
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: number) {
    return this.usersRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async getByEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: {
        email: email,
      },
    });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getByEmailSQL(email: string) {
    const user = await this.userSqlRepository.findOne({
      where: {
        email: email,
      },
    });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getByLoginSQL(login: string) {
    const user = await this.userSqlRepository.findOne({
      where: {
        login: login,
      },
    });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this login does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getById(id: number) {
    const user = await this.usersRepository.findOne({ where: { id: id } });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, {
      currentHashedRefreshToken,
    });
  }

  async updateProfile(updateUserDto: UpdateUserDto, user: UserEntityPg) {
    try {
      /*
      @TODO for admin make update by id
     */
      const updatedUser = await this.usersRepository.findOne({
        where: {
          id: user.id,
        },
      });

      if (!updatedUser) throw new UserNotFoundException(user.id);

      if (updatedUser.id === user.id || user.role === Role.Admin) {
        await this.usersRepository.update(user.id, updateUserDto);
        return await this.usersRepository.findOne({ where: { id: user.id } });
      } else {
        throw new HttpException(
          'You dont have rights to edit user',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (e) {
      console.log(e);
      if (e?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'One of the fields already exists.',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePassword(id: number, hashedPassword: string) {
    return await this.usersRepository.update(id, {
      password: hashedPassword,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
    const user = await this.getById(userId);

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  async removeRefreshToken(userId: number) {
    return this.usersRepository.update(userId, {
      currentHashedRefreshToken: null,
    });
  }

  async markEmailAsConfirmed(email: string) {
    return this.usersRepository.update(
      { email },
      {
        isEmailConfirmed: true,
      },
    );
  }

  async setNewPassword(email: string, password: string) {
    const user = await this.getByEmail(email);
    if (user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      return this.usersRepository.update(
        { email },
        {
          password: hashedPassword,
        },
      );
    }
  }

  async setNewPasswordSQL(email: string, password: string) {
    const user = await this.getByEmailSQL(email);
    if (user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      return this.userSqlRepository.update(
        { email },
        {
          password: hashedPassword,
        },
      );
    }
  }
}
