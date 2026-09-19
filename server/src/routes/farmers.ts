import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { Farmer } from '../types.js';

export const farmersRouter = Router();

/**
 * Get all registered farmers (Admin view)
 */
farmersRouter.get('/', (req: Request, res: Response) => {
  const farmers = db.farmers.find();
  return res.json({ success: true, farmers });
});

/**
 * Get farmer profile by ID
 */
farmersRouter.get('/:id', (req: Request, res: Response) => {
  const farmer = db.farmers.findById(req.params.id);
  if (!farmer) {
    return res.status(404).json({ error: 'Farmer not found' });
  }
  return res.json({ success: true, farmer });
});

/**
 * Register / Create a new farmer record
 */
farmersRouter.post('/', (req: Request, res: Response) => {
  const data = req.body;
  if (!data.name || !data.phone) {
    return res.status(400).json({ error: 'Name and Phone are required' });
  }

  const newFarmer: Farmer = {
    id: data.id || `FRM-OD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    name: data.name,
    phone: data.phone,
    aadhaarNumber: data.aadhaarNumber || 'XXXX-XXXX-9281',
    pmKisanId: data.pmKisanId || 'OD-PMK-' + Math.floor(10000000 + Math.random() * 90000000),
    district: data.district || 'Khordha',
    block: data.block || 'Bhubaneswar Sadar',
    village: data.village || 'Nuagaon',
    pincode: data.pincode || '752054',
    landAreaAcres: Number(data.landAreaAcres) || 4.5,
    khatianNumber: data.khatianNumber || 'KH-142/90',
    plotNumber: data.plotNumber || 'PL-3829',
    bankName: data.bankName || 'State Bank of India',
    bankAccountNumber: data.bankAccountNumber || 'XXXXXX4921',
    ifscCode: data.ifscCode || 'SBIN0001234',
    preferredLanguage: data.preferredLanguage || 'en'
  };

  db.farmers.insert(newFarmer);
  return res.status(201).json({ success: true, farmer: newFarmer });
});

/**
 * Update farmer profile
 */
farmersRouter.patch('/:id', (req: Request, res: Response) => {
  const updated = db.farmers.update(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Farmer not found' });
  }
  return res.json({ success: true, farmer: updated });
});
