import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './schema/user.entity';

export abstract class UserRepository {
  abstract save(userInfo: CreateUserDto): Promise<UserEntity>
  abstract findOne(criteria: Partial<UserEntity>): Promise<UserEntity>
  abstract find(criteria: Partial<UserEntity>): Promise<UserEntity[]>
} 