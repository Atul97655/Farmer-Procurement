import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { smsService } from '../services/smsService.js';

export const smsRouter = Router();

/**
 * Get recent simulated SMS logs
 */
smsRouter.get('/', (req: Request, res: Response) => {
  const { phone } = req.query;
  let logs = db.smsLogs.find();

  if (phone) {
    const cleanPhone = (phone as string).replace(/[^0-9]/g, '');
    logs = logs.filter(l => l.recipientPhone.replace(/[^0-9]/g, '').includes(cleanPhone));
  }

  return res.json({ success: true, count: logs.length, smsLogs: logs.slice(0, 50) });
});

/**
 * Send manual test SMS
 */
smsRouter.post('/send-test', async (req: Request, res: Response) => {
  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ error: 'phone and message required' });
  }

  const record = await smsService.sendSms({
    phone,
    templateId: 'DLT_CUSTOM_ALERT',
    message,
    meta: { test: true }
  });

  return res.json({ success: true, sms: record });
});
