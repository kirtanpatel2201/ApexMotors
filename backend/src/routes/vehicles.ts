import express from 'express';
import { prisma } from '../db';
import { authenticate, requireAdmin } from '../middleware/auth';
import { z } from 'zod';

export const vehiclesRouter = express.Router();

const vehicleSchema = z.object({
  maker: z.string(),
  model: z.string(),
  category: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().nonnegative(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
});

vehiclesRouter.use(authenticate);

vehiclesRouter.post('/', requireAdmin, async (req, res) => {
  try {
    const data = vehicleSchema.parse(req.body);
    const vehicle = await prisma.vehicle.create({ data });
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});

vehiclesRouter.get('/', async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany();
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

vehiclesRouter.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    const query = q ? String(q) : '';
    const vehicles = await prisma.vehicle.findMany({
      where: query ? {
        OR: [
          { maker: { contains: query, mode: 'insensitive' } },
          { model: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } }
        ]
      } : {}
    });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

vehiclesRouter.put('/:id', requireAdmin, async (req, res) => {
  try {
    const data = vehicleSchema.partial().parse(req.body);
    const vehicle = await prisma.vehicle.update({
      where: { id: String(req.params.id) },
      data
    });
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(400).json({ error: 'Update failed' });
  }
});

vehiclesRouter.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.vehicle.delete({
      where: { id: String(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Delete failed' });
  }
});

vehiclesRouter.post('/:id/purchase', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const vehicle = await prisma.vehicle.findUnique({ where: { id: String(req.params.id) } });
    if (!vehicle || vehicle.quantity <= 0) {
      return res.status(400).json({ error: 'Out of stock' });
    }
    
    // Create purchase record and decrement quantity atomically via interactive transaction
    const updated = await prisma.$transaction(async (tx) => {
      const updatedV = await tx.vehicle.update({
        where: { id: String(req.params.id) },
        data: { quantity: { decrement: 1 } }
      });

      if (updatedV.quantity < 0) {
        throw new Error('Out of stock');
      }

      await tx.purchase.create({
        data: {
          userId: user.userId,
          vehicleId: updatedV.id,
          amount: updatedV.price
        }
      });

      return updatedV;
    });

    res.status(200).json(updated);
  } catch (error: any) {
    if (error.message === 'Out of stock') {
      return res.status(400).json({ error: 'Out of stock' });
    }
    res.status(500).json({ error: 'Purchase failed' });
  }
});

vehiclesRouter.post('/:id/restock', requireAdmin, async (req, res) => {
  try {
    const amount = Number(req.body.quantity) || 1;
    if (amount <= 0) return res.status(400).json({ error: 'Restock quantity must be positive' });

    const vehicle = await prisma.vehicle.findUnique({ where: { id: String(req.params.id) } });
    if (!vehicle) return res.status(404).json({ error: 'Not found' });

    const updated = await prisma.vehicle.update({
      where: { id: String(req.params.id) },
      data: { quantity: vehicle.quantity + amount }
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Restock failed' });
  }
});

vehiclesRouter.get('/history/purchases', requireAdmin, async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        user: { select: { email: true } },
        vehicle: { select: { maker: true, model: true } }
      },
      orderBy: { purchasedAt: 'desc' }
    });
    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

