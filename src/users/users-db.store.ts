import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './schema/user.entity';
import { UserRepository } from './users.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class UserDBStore implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>
  ) {}
  async save(userInfo: CreateUserDto): Promise<UserEntity> {
    const user = new UserEntity();
    user.id = crypto.randomUUID();
    user.email = userInfo.email;
    user.password = userInfo.password;
    await this.userRepo.save(user);
    return user;
  }
  async findOne(criteria: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.userRepo.findOneBy(criteria);
    if (!user) {
      throw new NotFoundException(`user not found`);
    }
    return user;
  }
 async find(criteria: Partial<UserEntity>): Promise<UserEntity[]> {
    const users = await this.userRepo.findBy(criteria);
    if (users.length == 0) {
      throw new NotFoundException(`user not found`);
    }
    return users;
  }
  async update(criteria: Partial<UserEntity>, data: Partial<UserEntity>): Promise<UserEntity> {
    const queryBuilder = this.userRepo.createQueryBuilder('users');
    const result = await queryBuilder.update<UserEntity>(UserEntity, data)
      .where(criteria).updateEntity(true).execute();
    const model: UserEntity = result.raw[0] as UserEntity;
    return model;
  }
}