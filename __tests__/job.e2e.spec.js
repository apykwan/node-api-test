import request from "supertest";

import { connectDatabase, closeDatabase } from "./db-handler";
import app from '../app';

const newJob = {
  title: "Node Developer",
  description: "Must be a full-stack developer.",
  email: "employeer1@gmail.com",
  address: "651 Rr 2, Oquawka, IL, 61469",
  company: "Knack Ltd",
  industry: [],
  positions: 2,
  salary: 155000
}

let jwtToken = "";
let jobCreated = "";

beforeAll(async () => {
  await connectDatabase();
  const res = await request(app).post('/api/v1/register').send({
    name: 'Test1',
    email: 'test@gmail.com',
    password: "12345678"
  });

  jwtToken = res.body.token;
});

afterAll(async () => {
  console.log('afterall');
  await closeDatabase();
});

describe('Jobs (e2e)', () => {
  describe('(GET) - Get all jobs', () => {
    it('should get all jobs', async () => {
      const res = await request(app).get('/api/v1/jobs');

      expect(res.statusCode).toBe(200);
      expect(res.body.jobs).toBeInstanceOf(Array);
    });
  });

  describe('(POST) - Create new Job', () => {
    it('should throw validation error', async () => {
      const res = await request(app)
        .post('/api/v1/job/new')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ title: "PHP developer" });

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toMatch(/Please enter all values/i);
    });

    it('should create a new job', async () => {
      const res = await request(app)
        .post('/api/v1/job/new')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(newJob);

      expect(res.statusCode).toBe(200)
      expect(res.body.job).toMatchObject(newJob);
      expect(res.body.job._id).toBeDefined();

      jobCreated = res.body.job
    });
  });

  describe('(GET) - Get a job by id', () => {
    it('should get job by id', async () => {
      const res = await request(app).get(`/api/v1/job/${jobCreated._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.job).toMatchObject(jobCreated);
    });

    it('should throw job not found error', async () => {
      const res = await request(app).get(`/api/v1/job/6457b29be10b5b6cd985f234`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Job not found");
    });
  });

  describe('(PUT) - update a job', () => {
    it('should throw job not found error', async () => {
      const res = await request(app)
        .put(`/api/v1/job/6457b29be10b5b6cd985f234`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ title: "PHP developer" });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Job not found");
    });

    it('should update the job by id', async () => {
      const res = await request(app)
        .put(`/api/v1/job/${jobCreated._id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ title: "PHP developer" });

      expect(res.statusCode).toBe(200);
      expect(res.body.job.title).toBe("PHP developer");
      expect(res.body.job).toMatchObject({
        ...jobCreated,
        title: "PHP developer"
      });
    });
  });

  describe('(DELETE) - delete a job', () => {
    it('should throw job not found error', async () => {
      const res = await request(app)
        .delete(`/api/v1/job/6457b29be10b5b6cd985f234`)
        .set('Authorization', `Bearer ${jwtToken}`)

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Job not found");
    });

    it('should delete the job by id', async () => {
      const res = await request(app)
        .delete(`/api/v1/job/${jobCreated._id}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.job._id).toBe(jobCreated._id);
    });
  });
});