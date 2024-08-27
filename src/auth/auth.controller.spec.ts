import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: UsersService;
  const mockUserService = {
    createUser: jest.fn().mockResolvedValue({})
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{
        provide: UsersService,
        useValue: mockUserService,
      }]
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
   /**
   given a userInfo Object
  {
    "email": "bda605@hotmail.com",
    "password": "password" 
  }
   */
  it('service.createUser should be call once', async () => {
    const userInfo = {
      email: "bda605@hotmail.com",
      password: "password" 
    };
    await controller.register(userInfo);
    expect(service.createUser).toHaveBeenCalledTimes(1);
    expect(service.createUser).toHaveBeenCalledWith(userInfo);
  });
});
