import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  const mockUserService = {
    createUser: jest.fn().mockResolvedValue({}),
    findUser: jest.fn().mockResolvedValue({})
  }
  let controller: UsersController;
  let service: UsersService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{
        provide: UsersService,
        useValue: mockUserService,
      }]
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  /**
   given a userInfo Object
  {
    "id": uuid format 
  }
   */
  it('service.findUser should be called once', async () => {
    const userId = crypto.randomUUID();
    await controller.getUser(userId);
    expect(service.findUser).toHaveBeenCalledTimes(1);
    expect(service.findUser).toHaveBeenCalledWith({id: userId});
  })
});
