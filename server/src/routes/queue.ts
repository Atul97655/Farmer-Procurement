import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { eventService } from '../services/eventService.js';
import { smsService } from '../services/smsService.js';
import { QueueStatus, TimelineEvent } from '../types.js';

export const queueRouter = Router();

/**
 * Get live queue state for a procurement centre
 */
queueRouter.get('/:centreId', (req: Request, res: Response) => {
  const centreId = req.params.centreId as string;
  const centre = db.centres.findById(centreId);

  if (!centre) {
    return res.status(404).json({ error: 'Centre not found' });
  }

  const allProcurements = db.procurements.find(p => p.centreId === centreId);

  const calledTokens = allProcurements.filter(p => p.queueStatus === 'Called');
  const waitingTokens = allProcurements
    .filter(p => p.queueStatus === 'Waiting')
    .map((item, idx) => ({
      ...item,
      queuePosition: idx + 1,
      estimatedWaitMinutes: (idx + 1) * (centre.avgProcessingTimeMinutes || 7)
    }));

  const inServiceTokens = allProcurements.filter(
    p => p.queueStatus === 'Quality Check' || p.queueStatus === 'Weighing'
  );

  const completedToday = allProcurements.filter(p => p.queueStatus === 'Completed');

  return res.json({
    success: true,
    centre,
    summary: {
      totalActive: calledTokens.length + waitingTokens.length + inServiceTokens.length,
      calledCount: calledTokens.length,
      waitingCount: waitingTokens.length,
      inServiceCount: inServiceTokens.length,
      completedTodayCount: completedToday.length,
      avgWaitMinutes: centre.avgProcessingTimeMinutes || 7
    },
    calledTokens,
    waitingTokens,
    inServiceTokens,
    completedToday
  });
});

/**
 * Gate Check-In: Scanner or guard confirms farmer physical arrival at mandi
 */
queueRouter.post('/gate-checkin', async (req: Request, res: Response) => {
  const { tokenOrQrData, centreId } = req.body;

  if (!tokenOrQrData) {
    return res.status(400).json({ error: 'Token or QR data required' });
  }

  // Extract token from QR string if scanned e.g., KRISHISETU:PDC-1042:...
  let token = tokenOrQrData.trim();
  if (token.startsWith('KRISHISETU:')) {
    const parts = token.split(':');
    token = parts[1] || token;
  }

  const record = db.procurements.find(p => p.tokenNumber.toUpperCase() === token.toUpperCase() || p.id === token)[0];
  if (!record) {
    return res.status(404).json({ error: `No booking found for token: ${token}` });
  }

  const newTimelineEvent: TimelineEvent = {
    stage: 'FARMER_ARRIVED',
    timestamp: new Date().toLocaleString('en-IN'),
    title: 'Mandi Gate Inward Verified',
    description: `Farmer checked-in at Inward Gate. Vehicle verified.`
  };

  const updated = db.procurements.update(record.id, {
    stage: 'FARMER_ARRIVED',
    timeline: [...record.timeline, newTimelineEvent]
  });

  // Broadcast gate checkin
  eventService.broadcast('GATE_CHECKIN', { procurement: updated }, {
    centreId: record.centreId,
    procurementId: record.id,
    farmerId: record.farmerId
  });

  return res.json({
    success: true,
    message: `Token ${record.tokenNumber} checked in successfully at gate`,
    procurement: updated
  });
});

/**
 * Call Next Token: Operator calls waiting token into Quality / Weighing Bay
 */
queueRouter.post('/call-next', async (req: Request, res: Response) => {
  const { centreId, procurementId, bayNumber } = req.body;

  let target = procurementId
    ? db.procurements.findById(procurementId)
    : db.procurements.find(p => p.centreId === centreId && p.queueStatus === 'Waiting')[0];

  if (!target) {
    return res.status(404).json({ error: 'No waiting token available to call' });
  }

  const bay = bayNumber || 'Quality Bay 1 / Gate Inward';

  const updated = db.procurements.update(target.id, {
    queueStatus: 'Called',
    stage: target.stage === 'SLOT_ASSIGNED' ? 'FARMER_ARRIVED' : target.stage,
    timeline: [
      ...target.timeline,
      {
        stage: 'FARMER_ARRIVED',
        timestamp: new Date().toLocaleString('en-IN'),
        title: `Token Called to ${bay}`,
        description: `Mandi Operator initiated loudspeaker/SMS call for Token ${target.tokenNumber}.`
      }
    ]
  });

  // Send priority SMS
  await smsService.notifyTokenCalled(
    target.farmerName,
    target.farmerPhone,
    target.tokenNumber,
    bay,
    target.id
  );

  // Send Notification
  db.notifications.insert({
    id: `notif-${Date.now()}`,
    userId: target.farmerId,
    role: 'FARMER',
    title: `NOW CALLING: Token ${target.tokenNumber}`,
    message: `Your token ${target.tokenNumber} is called to ${bay}! Please move your tractor forward now.`,
    timestamp: new Date().toISOString(),
    type: 'queue',
    isRead: false,
    actionUrl: '/farmer/queue'
  });

  // Broadcast live event (triggers voice broadcast on farmer device and Mandi Kiosk TV)
  eventService.broadcast('TOKEN_CALLED', {
    procurement: updated,
    bayNumber: bay,
    tokenNumber: target.tokenNumber,
    farmerName: target.farmerName,
    cropType: target.cropType
  }, {
    centreId: target.centreId,
    procurementId: target.id,
    farmerId: target.farmerId
  });

  return res.json({ success: true, calledToken: updated });
});

/**
 * Update Queue Status (e.g. Move to Quality Check, Hold, etc.)
 */
queueRouter.post('/update-status', (req: Request, res: Response) => {
  const { procurementId, status } = req.body;

  if (!procurementId || !status) {
    return res.status(400).json({ error: 'procurementId and status are required' });
  }

  const record = db.procurements.findById(procurementId);
  if (!record) {
    return res.status(404).json({ error: 'Procurement record not found' });
  }

  const updated = db.procurements.update(record.id, {
    queueStatus: status as QueueStatus
  });

  eventService.broadcast('QUEUE_UPDATED', { centreId: record.centreId, procurement: updated }, {
    centreId: record.centreId,
    procurementId: record.id
  });

  return res.json({ success: true, procurement: updated });
});
