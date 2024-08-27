import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { isUUID } from 'class-validator';
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }))
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('ticket-booking-system');
  });
  it('/auth/register (POST) with failed', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'yu',
        password: '123'
      })
      .expect(400);
  });
  it('/auth/register (POST)', () => {
    const agent = request(app.getHttpServer());
    return agent
      .post('/auth/register')
      .send({
        email: 'yu@hotmail.com',
        password: '1@q#Abz%'
      })
      .expect(201)
      .expect(({ body }) => {
        userId = body.id;
        expect(isUUID(body.id)).toBeTruthy()
      });
  });
  it('/users/:userId (GET)', () => {
    const agent = request(app.getHttpServer());
    return agent
      .get(`/users/${userId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.email).toEqual('yu@hotmail.com')
      });
  })
  it('/users/:userId (GET) with failed', () => {
    const agent = request(app.getHttpServer());
    return agent
      .get(`/users/${crypto.randomUUID()}`)
      .expect(404);
  })
});
