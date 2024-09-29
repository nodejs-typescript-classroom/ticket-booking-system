import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { isUUID } from 'class-validator';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { StartedRedisContainer } from '@testcontainers/redis';
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  let refreshToken: string;
  let accessToken: string;
  let postgresql: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let eventId: string;
  let attendeeIdToken: string;
  let attendeeUserId: string;
  let attendEventId: string;
  let verifyTicketId: string;
  beforeAll(async () => {
    postgresql = global.postgresql;
    redis = global.redis;
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
    await redis.stop();
  })

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({name: 'ticket-booking-system'});
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
        userId = body.data.id;
        attendeeUserId = body.data.id;
        expect(isUUID(body.data.id)).toBeTruthy()
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
        refreshToken = body.data.refresh_token;
        accessToken = body.data.access_token;
        expect(body.data).toHaveProperty('access_token');
        expect(body.data).toHaveProperty('refresh_token');
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
        expect(isUUID(body.data.id)).toBeTruthy();
        eventId = body.data.id;
      });
  });
  // given exist eventid with existed event
  it('/events/:id (GET) with successfully retrieve event', () => {
    const agent = request(app.getHttpServer());
    return agent.get(`/events/${eventId}`)
      .set('Authorization', accessToken)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toHaveProperty('name', '江惠演唱會');
        expect(body.data).toHaveProperty('location', '台北大巨蛋')
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
        expect(body.data).toHaveProperty('events');
        expect(body.data.events.length).toEqual(1);
      });
  });
  // given exist eventid with existed event
  it('/events/:id (PATCH) with successfully updated event', () => {
    const agent = request(app.getHttpServer());
    return agent.patch(`/events/${eventId}`)
      .set('Authorization', accessToken)
      .send({
        location: '台北小巨蛋'
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toHaveProperty('name', '江惠演唱會');
        expect(body.data).toHaveProperty('location', '台北小巨蛋')
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
        expect(body.data).toHaveProperty('id')
        expect(isUUID(body.data.id)).toBeTruthy();
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
  it('/tickets (POST) create a ticket', (done) => {
    const agent = request(app.getHttpServer());
    agent.post('/events')
      .send({
        location: '台北大巨蛋',
        name: '江惠演唱會',
        startDate: '2024-10-01'
      })
      .set('Authorization', accessToken)
      .expect(201)
      .expect(({ body }) => {
        expect(body.data).toHaveProperty('id');
        expect(isUUID(body.data.id)).toBeTruthy();
        attendEventId = body.data.id;
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        agent
        .post('/auth/login')
        .send({
          email: 'yu@hotmail.com',
          password: '1@q#Abz%'
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body.data).toHaveProperty('access_token');
          attendeeIdToken = body.data.access_token;
        })
        .end((err, res) => {
          if (err) {
            done(err)
            return
          }
          agent.post('/tickets')
          .send({
            eventId: attendEventId,
            userId: attendeeUserId
          })
          .set('Authorization', attendeeIdToken)
          .expect(201)
          .expect(({ body }) => {
            expect(body).toHaveProperty('id');
            expect(isUUID(body.id)).toBeTruthy();
            verifyTicketId = body.id;
          })
          .end((err, res) => {
            done(err);
          })
        });
      });
  });
  it('/tickets/:id (GET) get a ticket', () => {
    const agent = request(app.getHttpServer());
    return agent.get(`/tickets/${verifyTicketId}`)
      .set('Authorization', attendeeIdToken)
      .expect(200)
      .expect(({ body }) => {
        expect(body.ticket).toHaveProperty('entered', false);
      });
  });
  it('/tickets (PATCH) verify a ticket', (done) => {
    const agent = request(app.getHttpServer());
    agent.patch('/tickets')
      .send({
        id: verifyTicketId
      })
      .set('Authorization', accessToken)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        agent.get(`/tickets/${verifyTicketId}`)
          .set('Authorization', attendeeIdToken)
          .expect(200)
          .expect(({ body }) => {
            expect(body.ticket).toHaveProperty('entered', true);
          })
          .end((err, res) => {
            done(err)
          })
      })
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
