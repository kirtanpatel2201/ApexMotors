import request from 'supertest';
import { app } from '../app';
import { prisma } from '../db';
import bcrypt from 'bcryptjs';

describe('Vehicle Endpoints', () => {
  let adminToken: string;
  let userToken: string;
  let vehicleId: string;

  beforeAll(async () => {
    await prisma.vehicle.deleteMany({});
    await prisma.user.deleteMany({});

    const passwordHash = await bcrypt.hash('password', 10);

    // Create Admin
    await prisma.user.create({
      data: { email: 'admin@example.com', passwordHash, role: 'ADMIN' }
    });

    // Create User
    await prisma.user.create({
      data: { email: 'user@example.com', passwordHash, role: 'USER' }
    });

    // Login Admin
    const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'password' });
    adminToken = adminRes.body.token;

    // Login User
    const userRes = await request(app).post('/api/auth/login').send({ email: 'user@example.com', password: 'password' });
    userToken = userRes.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/vehicles', () => {
    it('should allow admin to create a vehicle', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          maker: 'Toyota',
          model: 'Camry',
          category: 'Sedan',
          price: 25000,
          quantity: 5
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.maker).toBe('Toyota');
      vehicleId = response.body.id;
    });

    it('should deny non-admin users from creating a vehicle', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          maker: 'Honda',
          model: 'Civic',
          category: 'Sedan',
          price: 22000,
          quantity: 3
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/vehicles', () => {
    it('should allow authenticated users to view all vehicles', async () => {
      const response = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/vehicles/search', () => {
    it('should search vehicles by maker', async () => {
      const response = await request(app)
        .get('/api/vehicles/search?q=Toyota')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].maker).toBe('Toyota');
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('should allow admin to update a vehicle', async () => {
      const response = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          maker: 'Toyota',
          model: 'Corolla', // Changed model
          category: 'Sedan',
          price: 20000,
          quantity: 5
        });

      expect(response.status).toBe(200);
      expect(response.body.model).toBe('Corolla');
    });
  });

  describe('POST /api/vehicles/:id/purchase', () => {
    it('should allow user to purchase a vehicle, decreasing quantity', async () => {
      const response = await request(app)
        .post(`/api/vehicles/${vehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(4); // Was 5
    });

    it('should not allow purchase if quantity is zero', async () => {
      // Set quantity to 0 manually for test
      await prisma.vehicle.update({ where: { id: vehicleId }, data: { quantity: 0 } });
      
      const response = await request(app)
        .post(`/api/vehicles/${vehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Out of stock');
    });
  });

  describe('POST /api/vehicles/:id/restock', () => {
    it('should allow admin to restock a vehicle', async () => {
      const response = await request(app)
        .post(`/api/vehicles/${vehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 });

      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(10); // Was 0 + 10
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('should allow admin to delete a vehicle', async () => {
      const response = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
    });
  });
});
