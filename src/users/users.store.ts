import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './schema/user.entity';
import { UserRepository } from './users.repository';
import { unescape } from 'querystring';

export class UserStore implements UserRepository {
  users: UserEntity[] = [];
  async save(userInfo: CreateUserDto): Promise<UserEntity> {
    const id = crypto.randomUUID();
    const newUser = new UserEntity();
    newUser.id = id;
    newUser.email = userInfo.email;
    newUser.password = userInfo.password;
    if (userInfo.role) {
      newUser.role = userInfo.role;
    }
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