import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/schema/user.entity';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: UsersService;
  let authService: AuthService;
  const mockUserService = {
    createUser: jest.fn().mockResolvedValue({})
  }
  const mockAuthService = {
    login: jest.fn().mockResolvedValue({})
  }
  afterEach(() => {
    jest.clearAllMocks();
  })
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{
        provide: UsersService,
        useValue: mockUserService,
      }, {
        provide: AuthService,
        useValue: mockAuthService,
      }]
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
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
  /**
   * given a user instance
   */
  it('authService.login should be call once', async () => {
    const user = new UserEntity();
    await controller.login(user);
    expect(authService.login).toHaveBeenCalledTimes(1);
    expect(authService.login).toHaveBeenCalledWith(user);
  })
  /**
   * given a refreshToken, and userId
   */
  it('authService.login should be call once', async () => {
    const user = new UserEntity();
    await controller.refresh(user);
    expect(authService.login).toHaveBeenCalledTimes(1);
    expect(authService.login).toHaveBeenCalledWith(user);
  })
});
