import { ConflictException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './users.repository';
import { UserEntity } from './schema/user.entity';
import { UserDBStore } from './users-db.store';
@Injectable()
export class UsersService {
  constructor(
    @Inject(UserDBStore)
    private readonly userRepo: UserRepository,
  ) {}
  async createUser(userInfo: CreateUserDto) {
    try {
      const result = await this.userRepo.save({
        email: userInfo.email,
        password: await bcrypt.hash(userInfo.password, 10),
        role: userInfo.role
      })
      return {id: result.id }
    } catch (error) {
      // TODO: add proper logger
      console.error({ error: error.message, code: error?.code });
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
