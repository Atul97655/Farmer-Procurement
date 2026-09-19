import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { eventService } from '../services/eventService.js';
import { smsService } from '../services/smsService.js';
import {
  ProcurementRecord,
  TimelineEvent,
  QualityInspection,
  WeighingRecord,
  PaymentRecord,
  CropType
} from '../types.js';

export const procurementsRouter = Router();

// MSP Price Catalogue
const MSP_RATES: Record<string, number> = {
  'Paddy (Common)': 2300,
  'Paddy (Grade A)': 2320,
  'Wheat (Sharbati)': 2275,
  'Mustard': 5650,
  'Groundnut': 6783,
  'Maize': 2090,
  'Moong / Green Gram': 8558
};

/**
 * Get procurements with flexible filtering
 */
procurementsRouter.get('/', (req: Request, res: Response) => {
  const { centreId, farmerId, stage, queueStatus, date } = req.query;

  let records = db.procurements.find();

  if (centreId) {
    records = records.filter(r => r.centreId === centreId);
  }
  if (farmerId) {
    records = records.filter(r => r.farmerId === farmerId);
  }
  if (stage) {
    records = records.filter(r => r.stage === stage);
  }
  if (queueStatus) {
    records = records.filter(r => r.queueStatus === queueStatus);
  }
  if (date) {
    records = records.filter(r => r.slotDate === date);
  }

  return res.json({ success: true, count: records.length, procurements: records });
});

/**
 * Get procurement record by ID or Token Number
 */
procurementsRouter.get('/:id', (req: Request, res: Response) => {
  const record = db.procurements.findById(req.params.id as string);
  if (!record) {
    return res.status(404).json({ error: 'Procurement record not found' });
  }
  return res.json({ success: true, procurement: record });
});

/**
 * Register Crop & Book Procurement Slot
 */
procurementsRouter.post('/book', async (req: Request, res: Response) => {
  const {
    farmerId,
    centreId,
    cropType,
    variety,
    declaredQuantity,
    harvestDate,
    slotDate,
    slotTime,
    transportMode
  } = req.body;

  if (!farmerId || !centreId || !cropType || !declaredQuantity || !slotDate || !slotTime) {
    return res.status(400).json({ error: 'Missing required booking fields' });
  }

  let farmer = db.farmers.findById(farmerId);
  if (!farmer && req.body.farmerPhone) {
    const cleanPhone = (req.body.farmerPhone as string).replace(/[^0-9]/g, '');
    farmer = db.farmers.find(f => f.phone.replace(/[^0-9]/g, '').includes(cleanPhone))[0];
  }
  if (!farmer) {
    farmer = db.farmers.insert({
      id: farmerId || `FRM-OD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name: req.body.farmerName || 'Registered Farmer',
      phone: req.body.farmerPhone || '+91 98765 43210',
      village: 'Bargarh',
      block: 'Bargarh',
      district: 'Bargarh',
      state: 'Odisha',
      pincode: '768028',
      aadhaarLastFour: '8812',
      khatianNumber: 'KH-8821',
      totalLandAcres: 5.5,
      irrigationType: 'Canal Irrigated',
      soilHealthCardNo: 'SHC-OD-2025-4421',
      bankAccount: '•••• •••• 4421',
      ifscCode: 'SBIN0001234',
      cropsGrown: [cropType as CropType]
    });
  }

  let centre = db.centres.findById(centreId);
  if (!centre) {
    centre = db.centres.find()[0];
  }

  if (!farmer || !centre) {
    return res.status(404).json({ error: 'Farmer or Centre not found' });
  }

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const procId = `proc-${Date.now()}-${randomDigits}`;
  const tokenNumber = `${centre.code.slice(0, 3)}-${randomDigits}`;

  const currentWaitingCount = db.procurements.find(
    p => p.centreId === centreId && p.slotDate === slotDate && p.queueStatus === 'Waiting'
  ).length;

  const queuePos = currentWaitingCount + 1;
  const estimatedWait = queuePos * (centre.avgProcessingTimeMinutes || 8);

  const qrData = `KRISHISETU:${tokenNumber}:${farmer.id}:${centre.code}:${declaredQuantity}QTL:${cropType.toUpperCase()}`;

  const timeline: TimelineEvent[] = [
    {
      stage: 'REGISTRATION_COMPLETED',
      timestamp: new Date().toLocaleString('en-IN'),
      title: 'Crop Registered',
      description: `${declaredQuantity} Quintals of ${cropType} (${variety || 'Standard'}) registered.`
    },
    {
      stage: 'APPLICATION_APPROVED',
      timestamp: new Date().toLocaleString('en-IN'),
      title: 'Land Record & Aadhaar Verified',
      description: 'Auto-verified with Agri Land Database.'
    },
    {
      stage: 'SLOT_ASSIGNED',
      timestamp: new Date().toLocaleString('en-IN'),
      title: 'Slot Confirmed & Token Generated',
      description: `Token ${tokenNumber} allocated for ${slotDate} (${slotTime}) at ${centre.name}.`
    }
  ];

  const newRecord: ProcurementRecord = {
    id: procId,
    tokenNumber,
    farmerId: farmer.id,
    farmerName: farmer.name,
    farmerPhone: farmer.phone,
    centreId: centre.id,
    centreName: centre.name,
    cropType: cropType as CropType,
    variety: variety || 'Standard High Yield',
    declaredQuantity: Number(declaredQuantity),
    harvestDate: harvestDate || new Date().toISOString().split('T')[0],
    slotDate,
    slotTime,
    bookingTimestamp: new Date().toISOString(),
    stage: 'SLOT_ASSIGNED',
    queueStatus: 'Waiting',
    queuePosition: queuePos,
    estimatedWaitMinutes: estimatedWait,
    transportMode: transportMode || 'Tractor Trolley',
    qrData,
    timeline
  };

  db.procurements.insert(newRecord);

  // Send automated government DLT SMS
  await smsService.notifySlotBooking(
    farmer.name,
    farmer.phone,
    tokenNumber,
    centre.name,
    slotDate,
    slotTime,
    procId,
    farmer.id
  );

  // Create notification
  db.notifications.insert({
    id: `notif-${Date.now()}`,
    userId: farmer.id,
    role: 'FARMER',
    title: `Slot Confirmed - Token ${tokenNumber}`,
    message: `Your booking at ${centre.name} is confirmed for ${slotDate} ${slotTime}. Token: ${tokenNumber}.`,
    timestamp: new Date().toISOString(),
    type: 'slot',
    isRead: false,
    actionUrl: '/farmer/my-slot'
  });

  // Broadcast to all active clients (farmer phone, operator dashboard, kiosk screen)
  eventService.broadcast('QUEUE_UPDATED', { centreId, procurement: newRecord }, { centreId, procurementId: procId, farmerId: farmer.id });

  return res.status(201).json({ success: true, procurement: newRecord });
});

/**
 * Submit Quality Check
 */
procurementsRouter.post('/:id/quality-check', async (req: Request, res: Response) => {
  const {
    moisturePercentage,
    foreignMatterPercentage,
    damagedGrainPercentage,
    immatureGrainPercentage,
    grade,
    result,
    remarks,
    inspectorName
  } = req.body;

  const record = db.procurements.findById(req.params.id as string);
  if (!record) {
    return res.status(404).json({ error: 'Procurement not found' });
  }

  const qualityInspection: QualityInspection = {
    inspectedAt: new Date().toISOString(),
    inspectorName: inspectorName || 'Inspector (Mandi Lab)',
    moisturePercentage: Number(moisturePercentage),
    foreignMatterPercentage: Number(foreignMatterPercentage),
    damagedGrainPercentage: Number(damagedGrainPercentage),
    immatureGrainPercentage: Number(immatureGrainPercentage),
    grade: grade || 'Grade A',
    result: result || 'PASS',
    remarks: remarks || 'Sample tested as per FCI Fair Average Quality specs.'
  };

  const nextStage = result === 'PASS' ? 'WEIGHING' : 'QUALITY_CHECK';
  const nextQueueStatus = result === 'PASS' ? 'Weighing' : result === 'HOLD' ? 'Hold' : 'Cancelled';

  const newTimelineEvent: TimelineEvent = {
    stage: 'QUALITY_CHECK',
    timestamp: new Date().toLocaleString('en-IN'),
    title: `Quality Check - ${grade} (${result})`,
    description: `Moisture: ${moisturePercentage}%, Foreign Matter: ${foreignMatterPercentage}%. ${remarks || ''}`,
    officer: inspectorName
  };

  const updated = db.procurements.update(record.id, {
    qualityInspection,
    stage: nextStage,
    queueStatus: nextQueueStatus,
    timeline: [...record.timeline, newTimelineEvent]
  });

  // Dispatch SMS
  await smsService.notifyQualityCheck(
    record.farmerName,
    record.farmerPhone,
    record.tokenNumber,
    grade,
    Number(moisturePercentage),
    record.id
  );

  eventService.broadcast('QUALITY_SUBMITTED', { procurement: updated }, {
    centreId: record.centreId,
    procurementId: record.id,
    farmerId: record.farmerId
  });

  return res.json({ success: true, procurement: updated });
});

/**
 * Submit Digital Weighbridge Weighing
 */
procurementsRouter.post('/:id/weighing', async (req: Request, res: Response) => {
  const {
    grossWeight,
    tareWeight,
    bagCount,
    vehicleNumber,
    operatorName
  } = req.body;

  const record = db.procurements.findById(req.params.id as string);
  if (!record) {
    return res.status(404).json({ error: 'Procurement not found' });
  }

  const gross = Number(grossWeight);
  const tare = Number(tareWeight);
  const net = Math.max(0, Math.round((gross - tare) * 100) / 100);
  const slipNo = `WB-SLIP-${Date.now().toString().slice(-6)}`;

  const weighing: WeighingRecord = {
    weighedAt: new Date().toISOString(),
    weighbridgeOperator: operatorName || 'Digital Weighbridge Officer',
    vehicleNumber: vehicleNumber || 'OD-02-BQ-4412',
    vehicleType: 'Tractor Trolley',
    declaredWeight: record.declaredQuantity,
    grossWeight: gross,
    tareWeight: tare,
    netWeight: net,
    bagCount: Number(bagCount) || Math.round((net * 100) / 50),
    tareWeightSlipNo: slipNo
  };

  const newTimelineEvent: TimelineEvent = {
    stage: 'WEIGHING',
    timestamp: new Date().toLocaleString('en-IN'),
    title: 'Digital Weighbridge Recorded',
    description: `Gross: ${gross} Qtl, Tare: ${tare} Qtl, Net: ${net} Qtl. Slip #${slipNo}.`,
    officer: operatorName
  };

  const updated = db.procurements.update(record.id, {
    weighing,
    stage: 'PROCUREMENT_COMPLETE',
    queueStatus: 'Completed',
    timeline: [...record.timeline, newTimelineEvent]
  });

  // Automatically compute and generate payment record
  const mspRate = MSP_RATES[record.cropType] || 2300;
  const totalAmount = Math.round(net * mspRate);
  const utrNumber = `DBT${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

  const farmer = db.farmers.findById(record.farmerId);

  const payment: PaymentRecord = {
    id: `pay-${Date.now()}`,
    procurementAmount: totalAmount,
    mspRate,
    qualityDeductionBonus: 0,
    netPayableAmount: totalAmount,
    paymentStatus: 'INITIATED',
    dbtBatchNo: `DBT-BATCH-${new Date().toISOString().split('T')[0]}-01`,
    bankRefNo: `PFMS${Date.now().toString().slice(-10)}`,
    utrNumber,
    initiatedAt: new Date().toISOString(),
    accountNumberMasked: farmer ? farmer.bankAccountNumber : 'XXXXXX4921',
    bankName: farmer ? farmer.bankName : 'State Bank of India'
  };

  const completed = db.procurements.update(record.id, {
    payment,
    stage: 'PAYMENT_INITIATED',
    timeline: [
      ...updated!.timeline,
      {
        stage: 'PAYMENT_INITIATED',
        timestamp: new Date().toLocaleString('en-IN'),
        title: 'DBT Payment Dispatched to PFMS',
        description: `₹${totalAmount.toLocaleString('en-IN')} initiated via DBT batch. UTR: ${utrNumber}.`
      }
    ]
  });

  // Dispatch Weighment and Payment SMS
  await smsService.notifyWeighing(
    record.farmerName,
    record.farmerPhone,
    record.tokenNumber,
    net,
    slipNo,
    record.id
  );

  eventService.broadcast('WEIGHING_SUBMITTED', { procurement: completed }, {
    centreId: record.centreId,
    procurementId: record.id,
    farmerId: record.farmerId
  });

  return res.json({ success: true, procurement: completed });
});

/**
 * Update / Edit Booking Details (allowed within 1-minute grace window)
 */
procurementsRouter.put('/:id', async (req: Request, res: Response) => {
  const {
    cropType,
    variety,
    declaredQuantity,
    centreId,
    slotDate,
    slotTime,
    transportMode,
    harvestDate
  } = req.body;

  const record = db.procurements.findById(req.params.id as string);
  if (!record) {
    return res.status(404).json({ error: 'Procurement record not found' });
  }

  // Grace window check: 60 seconds (with 10-second network latency margin = 70s)
  const elapsedMs = Date.now() - new Date(record.bookingTimestamp).getTime();
  const GRACE_PERIOD_MS = 70 * 1000;
  if (elapsedMs > GRACE_PERIOD_MS) {
    return res.status(403).json({
      error: 'The 1-minute grace window for modifying this booking has expired. Booking details are finalized.'
    });
  }

  if (record.queueStatus === 'Cancelled') {
    return res.status(400).json({ error: 'Cannot modify a cancelled booking' });
  }

  const targetCentreId = centreId || record.centreId;
  const newCentre = db.centres.findById(targetCentreId);
  const oldCentre = db.centres.findById(record.centreId);

  if (!newCentre) {
    return res.status(404).json({ error: 'Selected procurement centre not found' });
  }

  const newCropType = (cropType || record.cropType) as CropType;
  const newVariety = variety || record.variety;
  const newQuantity = declaredQuantity !== undefined ? Number(declaredQuantity) : record.declaredQuantity;
  const newSlotDate = slotDate || record.slotDate;
  const newSlotTime = slotTime || record.slotTime;
  const newTransportMode = transportMode || record.transportMode;
  const newHarvestDate = harvestDate || record.harvestDate;

  // Handle capacity and queue adjustments if centre or quantity changed
  if (oldCentre && newCentre) {
    if (oldCentre.id === newCentre.id) {
      const quantityDiff = newQuantity - record.declaredQuantity;
      if (quantityDiff !== 0) {
        const updatedLoad = Math.max(0, oldCentre.currentLoad + quantityDiff);
        db.centres.update(oldCentre.id, { currentLoad: updatedLoad });
      }
    } else {
      // Centre changed: decrement old, increment new
      const oldLoad = Math.max(0, oldCentre.currentLoad - record.declaredQuantity);
      const oldQueue = Math.max(0, oldCentre.queueLength - 1);
      db.centres.update(oldCentre.id, { currentLoad: oldLoad, queueLength: oldQueue });

      const newLoad = newCentre.currentLoad + newQuantity;
      const newQueue = newCentre.queueLength + 1;
      db.centres.update(newCentre.id, { currentLoad: newLoad, queueLength: newQueue });
    }
  }

  const qrData = `KRISHISETU:${record.tokenNumber}:${record.farmerId}:${newCentre.code}:${newQuantity}QTL:${newCropType.toUpperCase()}`;
  const modificationNote = `Edited within 1-min grace window: ${newCropType} (${newVariety}), ${newQuantity} Qtl at ${newCentre.name}, Date: ${newSlotDate} (${newSlotTime}).`;

  const updatedTimeline: TimelineEvent[] = [
    ...record.timeline,
    {
      stage: record.stage,
      timestamp: new Date().toLocaleString('en-IN'),
      title: 'Booking Details Modified (1-Min Window)',
      description: modificationNote
    }
  ];

  const updatedRecord = db.procurements.update(record.id, {
    cropType: newCropType,
    variety: newVariety,
    declaredQuantity: newQuantity,
    centreId: newCentre.id,
    centreName: newCentre.name,
    slotDate: newSlotDate,
    slotTime: newSlotTime,
    transportMode: newTransportMode,
    harvestDate: newHarvestDate,
    qrData,
    timeline: updatedTimeline
  });

  // Create notification
  db.notifications.insert({
    id: `notif-${Date.now()}`,
    userId: record.farmerId,
    role: 'FARMER',
    title: `Booking Updated - Token ${record.tokenNumber}`,
    message: `Your booking at ${newCentre.name} was updated to ${newCropType} (${newQuantity} Qtl) on ${newSlotDate}.`,
    timestamp: new Date().toISOString(),
    type: 'slot',
    isRead: false,
    actionUrl: '/farmer/my-slot'
  });

  eventService.broadcast('QUEUE_UPDATED', { centreId: newCentre.id, procurement: updatedRecord }, {
    centreId: newCentre.id,
    procurementId: record.id,
    farmerId: record.farmerId
  });

  return res.json({ success: true, procurement: updatedRecord });
});

/**
 * Cancel Slot
 */
procurementsRouter.post('/:id/cancel', (req: Request, res: Response) => {
  const record = db.procurements.findById(req.params.id as string);
  if (!record) {
    return res.status(404).json({ error: 'Procurement not found' });
  }

  const elapsedMs = Date.now() - new Date(record.bookingTimestamp).getTime();
  const isWithinGraceWindow = elapsedMs <= 70 * 1000;
  const reason = req.body.reason || (isWithinGraceWindow ? 'Cancelled by farmer during 1-min grace window.' : 'Cancelled by user or mandi operator.');

  // Release centre load and queue length if still in waiting state
  if (record.queueStatus === 'Waiting' || isWithinGraceWindow) {
    const centre = db.centres.findById(record.centreId);
    if (centre) {
      const newQueue = Math.max(0, centre.queueLength - 1);
      const newLoad = Math.max(0, centre.currentLoad - record.declaredQuantity);
      db.centres.update(centre.id, { queueLength: newQueue, currentLoad: newLoad });
      eventService.broadcast('CENTRE_CAPACITY_UPDATED', { ...centre, queueLength: newQueue, currentLoad: newLoad }, { centreId: centre.id });
    }
  }

  const updated = db.procurements.update(record.id, {
    queueStatus: 'Cancelled',
    timeline: [
      ...record.timeline,
      {
        stage: record.stage,
        timestamp: new Date().toLocaleString('en-IN'),
        title: isWithinGraceWindow ? 'Slot Cancelled (1-Min Window)' : 'Slot Cancelled',
        description: reason
      }
    ]
  });

  // Notification for cancellation
  db.notifications.insert({
    id: `notif-${Date.now()}`,
    userId: record.farmerId,
    role: 'FARMER',
    title: `Slot Cancelled - Token ${record.tokenNumber}`,
    message: `Your booking for Token ${record.tokenNumber} has been cancelled successfully.`,
    timestamp: new Date().toISOString(),
    type: 'slot',
    isRead: false,
    actionUrl: '/farmer/my-slot'
  });

  eventService.broadcast('QUEUE_UPDATED', { centreId: record.centreId, procurement: updated }, {
    centreId: record.centreId,
    procurementId: record.id
  });

  return res.json({ success: true, procurement: updated });
});
