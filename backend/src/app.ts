import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { authRouter } from './routes/auth';
import { vehiclesRouter } from './routes/vehicles';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/vehicles', vehiclesRouter);

// Routes will be added here

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
