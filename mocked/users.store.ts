import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../src/users/users.repository';
import { UserEntity } from '../src/users/schema/user.entity';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
@Injectable()
export class UserStore implements UserRepository {
  users: UserEntity[] = [];
  async save(userInfo: CreateUserDto): Promise<UserEntity> {
    const id = crypto.randomUUID();
    const newUser = new UserEntity();
    newUser.id = id;
    newUser.email = userInfo.email;
    newUser.password = userInfo.password;
    this.users.push(newUser);
    return newUser;
  }
  async findOne(criteria: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.users.find((item) => {
      return item.id ==  criteria.id || item.email == criteria.email
    });
    if (!user) {
      throw new NotFoundException({ message: `user with ${criteria.id} not found`});
    }
    return user;
  }
  async find(criteria: Partial<UserEntity>): Promise<UserEntity[]> {
    throw new Error('Method not implemented.');
  }
  async update(criteria: Partial<UserEntity>, data: Partial<UserEntity>): Promise<UserEntity> {
    const foundIdx = this.users.findIndex((item) => {
      return item.id ==  criteria.id || item.email == criteria.email
    });
    if (foundIdx == -1) {
      throw new NotFoundException({ message: `user with ${criteria.id} not found`});
    }   
    this.users[foundIdx].refreshToken = data.refreshToken;
    return this.users[foundIdx];
  } 
}