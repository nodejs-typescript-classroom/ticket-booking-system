import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserStore } from './users.store';
import { UserRepository } from './users.repository';
import { UserEntity } from './schema/user.entity';
@Injectable()
export class UsersService {
  constructor(
    @Inject(UserStore)
    private readonly userRepo: UserRepository,
  ) {}
  async createUser(userInfo: CreateUserDto) {
    const result = await this.userRepo.save({
      email: userInfo.email,
      password: await bcrypt.hash(userInfo.password, 10)
    })
    return {id: result.id }
  }
  async findUser(userInfo: Partial<UserEntity>) {
    const result = await this.userRepo.findOne(userInfo);
    return result;
  }
}
