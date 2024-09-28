import { ConflictException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateUserDto, CreateUserResponse } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './users.repository';
import { UserEntity } from './schema/user.entity';
import { UserDBStore } from './users-db.store';
import { ApiResponse } from '../api-response.dto';
@Injectable()
export class UsersService {
  private logger: Logger = new Logger(UsersService.name);
  constructor(
    @Inject(UserDBStore)
    private readonly userRepo: UserRepository,
  ) {}
  async createUser(userInfo: CreateUserDto): Promise<ApiResponse<CreateUserResponse>> {
    try {
      const result = await this.userRepo.save({
        email: userInfo.email,
        password: await bcrypt.hash(userInfo.password, 10),
      })
      return {
        message: 'create user success',
        data: {
          id: result.id
        } 
      }
    } catch (error) {
      // add proper logger
      this.logger.error({ code: error?.code }, error.message);
      if (error?.code == '23505') {
        throw new ConflictException(`email ${userInfo.email} existed`);
      }
      throw new InternalServerErrorException();
    }
  }
  async findUser(userInfo: Partial<UserEntity>) {
    const result = await this.userRepo.findOne(userInfo);
    return result;
  }
  async updateUser(criteria: Partial<UserEntity>, data: Partial<UserEntity>) {
    const result = await this.userRepo.update(criteria, data);
    return result;
  }
}
