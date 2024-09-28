import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { isUUID } from 'class-validator';
import { UserStore } from '../../mocked/users.store';
import { UserDBStore } from './users-db.store';

describe('UsersService', () => {
  let service: UsersService;
  let userId: string;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, {
        provide: UserDBStore,
        useClass: UserStore,
      }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  /**  given a valid user info object
  {
    "email": "bda605@hotmail.com",
    "password": "password" 
  }
  ===>
  {
    "id": uuid format string
  }
  */
  it('should return an created hashed', async () => {
    const userInfo = {
      email: 'bda605@hotmail.com',
      password: 'password',
    }
    const result = await service.createUser(userInfo);
    userId = result.data.id;
    expect(result.data).toHaveProperty('id');
    expect(isUUID(result.data['id'], 4)).toBeTruthy();
  });
  it('should return result with given criteria', async () => {
    const userInfo = {
      id: userId,
    };
    const expectEmail = 'bda605@hotmail.com';
    const result = await service.findUser(userInfo);
    expect(result.email).toEqual(expectEmail);
  })
});
