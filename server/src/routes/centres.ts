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
  const centre = db.centres.findById(req.params.id);
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

  const updated = db.centres.update(req.params.id, updates);
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
