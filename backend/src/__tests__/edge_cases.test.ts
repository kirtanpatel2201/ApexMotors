import request from 'supertest';
import { app } from '../app';
import { prisma } from '../db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

describe('Edge Cases and Security Tests', () => {
  let userToken: string;
  let adminToken: string;
  let vehicleId: string;

  beforeAll(async () => {
    // Clear DB
    await prisma.purchase.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();

    // Create Admin
    const adminHash = await bcrypt.hash('adminpass', 10);
    const admin = await prisma.user.create({
      data: { email: 'test_admin@test.com', passwordHash: adminHash, role: 'ADMIN' }
    });
    adminToken = jwt.sign({ userId: admin.id, role: admin.role }, JWT_SECRET);

    // Create User
    const userHash = await bcrypt.hash('userpass', 10);
    const user = await prisma.user.create({
      data: { email: 'test_user@test.com', passwordHash: userHash, role: 'USER' }
    });
    userToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);

    // Create Initial Vehicle
    const v = await prisma.vehicle.create({
      data: { maker: 'TestMaker', model: 'TestModel', category: 'Test', price: 10000, quantity: 1 }
    });
    vehicleId = v.id;
  });

  describe('Security & Authentication (Attack Vectors)', () => {
    it('should reject requests with missing token', async () => {
      const res = await request(app).post('/api/vehicles');
      expect(res.status).toBe(401);
    });

    it('should reject requests with tampered JWT signatures', async () => {
      const tamperedToken = adminToken.slice(0, -1) + 'a'; // Alter signature
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${tamperedToken}`);
      expect(res.status).toBe(401);
    });

    it('should prevent standard users from accessing admin routes (RBAC bypass attempt)', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ maker: 'Hack', model: 'Hack', category: 'Hack', price: 10, quantity: 10 });
      expect(res.status).toBe(403);
    });
  });

  describe('Business Logic & Negative Value Injection', () => {
    it('should prevent creating a vehicle with negative price', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ maker: 'Neg', model: 'Price', category: 'Test', price: -5000, quantity: 5 });
      expect(res.status).toBe(400);
    });

    it('should prevent creating a vehicle with negative quantity', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ maker: 'Neg', model: 'Qty', category: 'Test', price: 5000, quantity: -5 });
      expect(res.status).toBe(400);
    });

    it('should prevent restocking with a negative amount (Stock decrement attack)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -10 });
      // If it passes, the API is vulnerable. We expect a 400.
      expect(res.status).toBe(400); 
    });
  });

  describe('Concurrency & Stock Limits', () => {
    it('should prevent out of stock purchasing', async () => {
      // First, buy the only car
      await request(app)
        .post(`/api/vehicles/${vehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);
      
      // Try to buy again
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Out of stock');
    });

    it('should enforce atomic stock decrementing during race conditions', async () => {
      // Restock exactly 1
      await prisma.vehicle.update({ where: { id: vehicleId }, data: { quantity: 1 } });

      // Simulate 5 rapid concurrent requests
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post(`/api/vehicles/${vehicleId}/purchase`)
            .set('Authorization', `Bearer ${userToken}`)
        );
      }
      
      const results = await Promise.all(promises);
      const successes = results.filter(r => r.status === 200).length;
      const failures = results.filter(r => r.status === 400).length;

      // Only 1 should succeed, 4 should fail
      expect(successes).toBe(1);
      expect(failures).toBe(4);

      // Final stock should be 0, not negative
      const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
      expect(vehicle?.quantity).toBe(0);
    });
  });
});
