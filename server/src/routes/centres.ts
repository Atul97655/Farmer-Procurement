import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { eventService } from '../services/eventService.js';
import { CentreStatus } from '../types.js';

export const centresRouter = Router();

/**
 * Get all procurement centres with live calculated metrics
 */
centresRouter.get('/', (req: Request, res: Response) => {
  const allCentres = db.centres.find();
  const allProcurements = db.procurements.find();

  // Enrich each centre with up-to-date queue lengths and current load
  const enriched = allCentres.map(centre => {
    const activeForCentre = allProcurements.filter(
      p => p.centreId === centre.id && p.stage !== 'PAYMENT_COMPLETED' && p.queueStatus !== 'Cancelled'
    );
    const activeLoad = activeForCentre.reduce((acc, curr) => acc + (curr.declaredQuantity || 0), 0);
    const waitingQueue = activeForCentre.filter(p => p.queueStatus === 'Waiting' || p.queueStatus === 'Called').length;

    return {
      ...centre,
      queueLength: waitingQueue,
      currentLoad: Math.min(centre.dailyCapacity, activeLoad)
    };
  });

  return res.json({ success: true, centres: enriched });
});

/**
 * Get single centre details
 */
centresRouter.get('/:id', (req: Request, res: Response) => {
  const centre = db.centres.findById(req.params.id as string);
  if (!centre) {
    return res.status(404).json({ error: 'Centre not found' });
  }
  return res.json({ success: true, centre });
});

/**
 * Update centre capacity or status (Admin/Operator)
 */
centresRouter.patch('/:id/capacity', (req: Request, res: Response) => {
  const { newDailyCapacity, newStatus } = req.body;
  const updates: Partial<{ dailyCapacity: number; status: CentreStatus }> = {};

  if (newDailyCapacity !== undefined) {
    updates.dailyCapacity = Number(newDailyCapacity);
  }
  if (newStatus) {
    updates.status = newStatus as CentreStatus;
  }

  const updated = db.centres.update(req.params.id as string, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Centre not found' });
  }

  // Broadcast event to connected clients
  eventService.broadcast('CENTRE_CAPACITY_UPDATED', updated, { centreId: updated.id });

  return res.json({ success: true, centre: updated });
});

/**
 * Register a new procurement centre
 */
centresRouter.post('/', (req: Request, res: Response) => {
  const newCentreData = req.body;
  const id = `c-${Date.now().toString().slice(-4)}`;
  const code = newCentreData.code || `DPC-${Math.floor(10 + Math.random() * 90)}`;

  const centre = {
    ...newCentreData,
    id,
    code,
    queueLength: 0,
    currentLoad: 0,
    status: newCentreData.status || 'NORMAL'
  };

  db.centres.insert(centre);
  eventService.broadcast('CENTRE_CAPACITY_UPDATED', centre, { centreId: id });

  return res.status(201).json({ success: true, centre });
});

/**
 * Put a centre on hold (pause intake)
 */
centresRouter.post('/:id/hold', (req: Request, res: Response) => {
  const centre = db.centres.findById(req.params.id as string);
  if (!centre) {
    return res.status(404).json({ error: 'Centre not found' });
  }

  const { reason } = req.body;
  const newStatus: CentreStatus = centre.status === 'HOLD' ? 'NORMAL' : 'HOLD';
  const updated = db.centres.update(req.params.id as string, { status: newStatus });

  eventService.broadcast('CENTRE_CAPACITY_UPDATED', { ...updated, holdReason: reason || 'Admin action' }, { centreId: centre.id });

  return res.json({
    success: true,
    message: newStatus === 'HOLD' ? `Centre ${centre.code} placed on hold` : `Centre ${centre.code} resumed to normal`,
    centre: updated
  });
});

/**
 * Rebalance queue: redistribute waiting tokens from this centre to least loaded neighbours
 */
centresRouter.post('/:id/rebalance', (req: Request, res: Response) => {
  const centre = db.centres.findById(req.params.id as string);
  if (!centre) {
    return res.status(404).json({ error: 'Centre not found' });
  }

  const allCentres = db.centres.find();
  const waitingProcurements = db.procurements
    .find(p => p.centreId === centre.id && p.queueStatus === 'Waiting');

  if (waitingProcurements.length === 0) {
    return res.json({ success: true, message: 'No waiting tokens to rebalance', rebalanced: 0 });
  }

  // Find alternative centres sorted by current load ascending (least loaded first), exclude self
  const alternatives = allCentres
    .filter(c => c.id !== centre.id && c.status !== 'HOLD')
    .sort((a, b) => a.currentLoad - b.currentLoad);

  if (alternatives.length === 0) {
    return res.json({ success: true, message: 'No alternative centres available for rebalancing', rebalanced: 0 });
  }

  let rebalancedCount = 0;
  const transfers: { procurementId: string; from: string; to: string }[] = [];

  for (const proc of waitingProcurements) {
    const target = alternatives[rebalancedCount % alternatives.length];
    db.procurements.update(proc.id, { centreId: target.id });
    transfers.push({ procurementId: proc.id, from: centre.id, to: target.id });
    rebalancedCount++;
  }

  eventService.broadcast('QUEUE_REBALANCED', {
    sourceCentreId: centre.id,
    transfers,
    count: rebalancedCount
  }, { centreId: centre.id });

  return res.json({
    success: true,
    message: `Rebalanced ${rebalancedCount} waiting token(s) from ${centre.code}`,
    rebalanced: rebalancedCount,
    transfers
  });
});
