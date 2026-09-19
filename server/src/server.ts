import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { eventService } from './services/eventService.js';
import { authRouter } from './routes/auth.js';
import { centresRouter } from './routes/centres.js';
import { farmersRouter } from './routes/farmers.js';
import { procurementsRouter } from './routes/procurements.js';
import { queueRouter } from './routes/queue.js';
import { paymentsRouter } from './routes/payments.js';
import { notificationsRouter } from './routes/notifications.js';
import { smsRouter } from './routes/sms.js';
import { aiRouter } from './routes/ai.js';
import { db } from './db/database.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite development
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path !== '/api/events') {
    console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.path}`);
  }
  next();
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'KISAN-Q Mandi Backend',
    sihProblemStatement: 'SIH26032',
    ministry: 'Ministry of Consumer Affairs, Food & Public Distribution',
    uptimeSeconds: Math.round(process.uptime()),
    activeSseClients: eventService.getClientCount(),
    timestamp: new Date().toISOString()
  });
});

// Server-Sent Events (SSE) for Real-Time Queue & Notification Streaming
const sseHandler = (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  res.flushHeaders();

  eventService.addClient(res);

  // Send periodic heartbeat every 20 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': ping\n\n');
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
  });
};

app.get('/api/events', sseHandler);
app.get('/events', sseHandler);

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/centres', centresRouter);
app.use('/api/farmers', farmersRouter);
app.use('/api/procurements', procurementsRouter);
app.use('/api/queue', queueRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/sms', smsRouter);
app.use('/api/ai', aiRouter);

// Reset demo database to initial state
app.post('/api/admin/reset-demo', (req: Request, res: Response) => {
  db.resetToDefaults();
  return res.json({ success: true, message: 'Database reset to default seed successfully' });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

app.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🌾 KISAN-Q Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Real-Time SSE Stream: http://localhost:${PORT}/api/events`);
  console.log(`🎯 SIH26032: Ministry of Consumer Affairs, Food & Public Distribution`);
  console.log('================================================================');
});
