import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserEntity } from '../users/schema/user.entity';
import { isJWT } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserStore } from '../users/users.store';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';


describe('AuthService', () => {
  let service: AuthService;
  let userService: UsersService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, {
        provide: ConfigService,
        useValue: {
          get: (key: string): any => {
            switch (key) {
              case 'JWT_ACCESS_TOKEN_SECRET':
                return '123';
              case 'JWT_ACCESS_TOKEN_EXPIRATION_MS':
                return 1;
              case 'JWT_REFRESH_TOKEN_SECRET':
                return '246';
              case 'JWT_REFRESH_TOKEN_EXPIRATION_MS':
                return 1;
              default:
                throw new Error('not exist key');  
            }
          }
        },
      }, JwtService, UsersService, UserStore],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  // given login credential with correct user
  it('should be return access token and refresh token', async () => {
    const user = new UserEntity();
    user.email = 'test@gmail.com';
    const receiveObj = await userService.createUser({
      email: user.email,
      password: '@1#$aB%22^'
    });
    user.id = receiveObj.id;
    const result = await service.login(user);
    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('refresh_token');
    expect(isJWT(result.access_token)).toBeTruthy();
    expect(isJWT(result.refresh_token)).toBeTruthy();
  });
  // given with not existed user
  it('should be rejected with not found error ', async () => {
    const user = new UserEntity();
    user.email = 'test1@gmail.com';
    user.id = crypto.randomUUID();
    expect(service.login(user)).rejects.toThrow(NotFoundException);
  });
  // given a exist user
  it('should verifyUser with user entity', async () => {
    const email = 'test@gmail.com';
    const password = '@1#$aB%22^';
    await userService.createUser({
      email: email,
      password: password
    });
    const result = await service.verifyUser(email, password);
    expect(result).toHaveProperty('email', 'test@gmail.com');
  });
  // given a exist user, but wrong credential
  it('should verifyUser with Unauthorization Exception', async () => {
    const email = 'test@gmail.com';
    const password = '@1#$aB%22^';
    await userService.createUser({
      email: email,
      password: password
    });
    await expect(service.verifyUser(email, '1232')).rejects.toThrow(UnauthorizedException);
  });
  // given a exist refreshToken, and userId
  it('should refreshToken with origin user', async () => {
    const email = 'test@gmail.com';
    const password = '@1#$aB%22^';
    const object = await userService.createUser({
      email: email,
      password: password
    });
    const user = await userService.findUser({ id: object.id });
    const loginResult = await service.login(user);
    const result = await service.refreshToken(loginResult.refresh_token, object.id);
    expect(result.email).toEqual(email);
  })
  // given a exist refreshToken, and userId, but wrong refresh token
  it('should refreshToken reject with Uauthorization', async () => {
    const email = 'test@gmail.com';
    const password = '@1#$aB%22^';
    const object = await userService.createUser({
      email: email,
      password: password
    });
    const user = await userService.findUser({ id: object.id });
    const loginResult = await service.login(user);
    await expect(service.refreshToken(loginResult.refresh_token.replace('1','2'), user.id)).rejects.toThrow(UnauthorizedException);
  })
});
