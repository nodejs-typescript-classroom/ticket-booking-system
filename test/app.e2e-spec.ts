import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { isUUID } from 'class-validator';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  let refreshToken: string;
  let accessToken: string;
  let postgresql: StartedPostgreSqlContainer;
  let eventId: string;
  beforeAll(async () => {
    postgresql = global.postgresql;
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
  afterAll(async () => {
    await app.close();
    await postgresql.stop();
  })

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
        password: '1@q#Abz%',
      })
      .expect(201)
      .expect(({ body }) => {
        userId = body.id;
        expect(isUUID(body.id)).toBeTruthy()
      });
  });
  // given login with correct credential
  it('/auth/login (POST)', () => {
    const agent = request(app.getHttpServer());
    return agent
      .post('/auth/login')
      .send({
        email: 'admin@hotmail.com',
        password: '1@q#Abz%'
      })
      .expect(201)
      .expect(({body}) => {
        refreshToken = body.refresh_token;
        accessToken = body.access_token;
        expect(body).toHaveProperty('access_token');
        expect(body).toHaveProperty('refresh_token');
      });
  })
  it('/users/:userId (GET)', () => {
    const agent = request(app.getHttpServer());
    return agent
      .get(`/users/${userId}`)
      .set('Authorization', accessToken)
      .expect(200)
      .expect(({ body }) => {
        expect(body.email).toEqual('yu@hotmail.com')
      });
  })
  it('/users/:userId (GET) with failed', () => {
    const agent = request(app.getHttpServer());
    return agent
      .get(`/users/${crypto.randomUUID()}`)
      .set('Authorization', accessToken)
      .expect(404);
  })
  // given login with wrong credential with Unauthorizatiion
  it('/auth/login (POST) reject with Unauthorization', () => {
    const agent = request(app.getHttpServer());
    return agent
      .post('/auth/login')
      .send({
        email: 'yu@hotmail.com',
        password: '1@q#Abz%1'
      })
      .expect(401);
  })
  // given wrong acess token to create a event
  it('/events (POST) reject with Unauthorization', () => {
    const agent = request(app.getHttpServer());
    return agent.post('/events')
      .send({
        location: '台北大巨蛋',
        name: '江惠演唱會',
        startDate: '2024-10-01'
      })
      .set('Authorization', '1245')
      .expect(401);
  });
  // given access token to create a event
  it('/events (POST) with successfully create event', () => {
    const agent = request(app.getHttpServer());
    return agent.post('/events')
      .send({
        location: '台北大巨蛋',
        name: '江惠演唱會',
        startDate: '2024-10-01'
      })
      .set('Authorization', accessToken)
      .expect(201)
      .expect(({ body }) => {
        expect(isUUID(body.id)).toBeTruthy();
        eventId = body.id;
      });
  });
  // given exist eventid with existed event
  it('/events/:id (GET) with successfully retrieve event', () => {
    const agent = request(app.getHttpServer());
    return agent.get(`/events/${eventId}`)
      .set('Authorization', accessToken)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveProperty('name', '江惠演唱會');
        expect(body).toHaveProperty('location', '台北大巨蛋')
      });
  });
  // given exist location with existed event
  it('/events/ (GET) with successfully retrieve event', () => {
    const agent = request(app.getHttpServer());
    return agent.get(`/events`)
      .query({
        location: '台北大巨蛋'
      })
      .set('Authorization', accessToken)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveProperty('events');
        expect(body.events.length).toEqual(1);
      });
  });
  // given wrong token with get event
  it('/events/ (GET) reject with Uanuthorization', () => {
    const agent = request(app.getHttpServer());
    return agent.get(`/events`)
      .query({
        location: '台北大巨蛋'
      })
      .set('Authorization', '123')
      .expect(401);
  });
  // given wrong token with delete event
  it('/events/:id (DELETE) reject with Uanuthorization', () => {
    const agent = request(app.getHttpServer());
    return agent.delete(`/events/${eventId}`)
      .set('Authorization', '1234')
      .expect(401)
  });
  // given exist event id with existed event
  it('/events/:id (DELETE) with successfully delete event', (done) => {
    const agent = request(app.getHttpServer());
    agent.delete(`/events/${eventId}`)
      .set('Authorization', accessToken)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveProperty('id')
        expect(isUUID(body.id)).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        agent.get(`/events/${eventId}`)
          .set('Authorization', accessToken)
          .expect(404)
          .end((err, res) =>{
            done(err);
          });
      });
  });
  // given refesh token with exist users
  it('/auth/refresh (POST)', () => {
    const agent = request(app.getHttpServer());
    return agent
      .post('/auth/refresh')
      .set('Authorization', refreshToken)
      .expect(201);
  });
});
