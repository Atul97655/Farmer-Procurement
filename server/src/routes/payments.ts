import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { eventService } from '../services/eventService.js';
import { smsService } from '../services/smsService.js';
import { TimelineEvent } from '../types.js';

export const paymentsRouter = Router();

/**
 * Get all payment & DBT records
 */
paymentsRouter.get('/', (req: Request, res: Response) => {
  const { farmerId, status } = req.query;
  const procurementsWithPayment = db.procurements
    .find(p => p.payment !== undefined)
    .map(p => ({
      ...p.payment!,
      procurementId: p.id,
      tokenNumber: p.tokenNumber,
      farmerId: p.farmerId,
      farmerName: p.farmerName,
      cropType: p.cropType,
      netWeight: p.weighing?.netWeight || p.declaredQuantity
    }));

  let filtered = procurementsWithPayment;
  if (farmerId) {
    filtered = filtered.filter(p => p.farmerId === farmerId);
  }
  if (status) {
    filtered = filtered.filter(p => p.paymentStatus === status);
  }

  return res.json({ success: true, count: filtered.length, payments: filtered });
});

/**
 * Release/Credit DBT Payment Batch
 */
paymentsRouter.post('/release-dbt', async (req: Request, res: Response) => {
  const { procurementId, utrNumber } = req.body;

  if (!procurementId) {
    return res.status(400).json({ error: 'procurementId is required' });
  }

  const record = db.procurements.findById(procurementId);
  if (!record || !record.payment) {
    return res.status(404).json({ error: 'Procurement or payment record not found' });
  }

  const finalUtr = utrNumber || `SBIN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

  const updatedPayment = {
    ...record.payment,
    paymentStatus: 'CREDITED' as const,
    utrNumber: finalUtr,
    creditedAt: new Date().toISOString()
  };

  const timelineEvent: TimelineEvent = {
    stage: 'PAYMENT_COMPLETED',
    timestamp: new Date().toLocaleString('en-IN'),
    title: 'DBT Payment Credited (PFMS Cleared)',
    description: `₹${record.payment.netPayableAmount.toLocaleString('en-IN')} credited to ${record.payment.bankName}. UTR: ${finalUtr}`
  };

  const updated = db.procurements.update(record.id, {
    payment: updatedPayment,
    stage: 'PAYMENT_COMPLETED',
    timeline: [...record.timeline, timelineEvent]
  });

  // Send DBT credited SMS
  await smsService.notifyPaymentCredited(
    record.farmerName,
    record.farmerPhone,
    record.tokenNumber,
    record.payment.netPayableAmount,
    finalUtr,
    record.payment.accountNumberMasked,
    record.id
  );

  // Send Notification
  db.notifications.insert({
    id: `notif-${Date.now()}`,
    userId: record.farmerId,
    role: 'FARMER',
    title: `Payment Credited - ₹${record.payment.netPayableAmount.toLocaleString('en-IN')}`,
    message: `Direct Benefit Transfer of ₹${record.payment.netPayableAmount.toLocaleString('en-IN')} has been credited to your bank account. UTR: ${finalUtr}`,
    timestamp: new Date().toISOString(),
    type: 'payment',
    isRead: false,
    actionUrl: '/farmer/payments'
  });

  eventService.broadcast('NOTIFICATION_SENT', { procurement: updated }, {
    centreId: record.centreId,
    procurementId: record.id,
    farmerId: record.farmerId
  });

  return res.json({ success: true, procurement: updated, utrNumber: finalUtr });
});
