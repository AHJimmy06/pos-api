import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Auth & Authorization (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should authenticate admin user and fail to unlock a non-existent blocked user with 404', async () => {
    // 1. Login
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@pos.com',
        password: 'Admin123@',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('accessToken');
    const token = (loginRes.body as { accessToken: string }).accessToken;

    // 2. Try to unlock user 999 (should be 404 because user is not blocked, but NOT 401 or 403)
    const unlockRes = await request(app.getHttpServer())
      .post('/users/999/unlock')
      .set('Authorization', `Bearer ${token}`);

    expect(unlockRes.status).toBe(404);
  });

  it('should fail with 401 if no token is provided', async () => {
    const unlockRes = await request(app.getHttpServer()).post(
      '/users/999/unlock',
    );

    expect(unlockRes.status).toBe(401);
  });
});
