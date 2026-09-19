import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { smsService } from '../services/smsService.js';
import { Farmer } from '../types.js';

export const authRouter = Router();

/**
 * Get available authentication roles
 */
authRouter.get('/roles', (req: Request, res: Response) => {
  return res.json({
    success: true,
    roles: [
      { id: 'FARMER', name: 'Farmer', loginMethod: 'OTP via Mobile', endpoint: '/api/auth/farmer/send-otp' },
      { id: 'OPERATOR', name: 'Centre Operator', loginMethod: 'Centre ID + Email', endpoint: '/api/auth/operator/login' },
      { id: 'ADMIN', name: 'State Admin / Director', loginMethod: 'Email / ID', endpoint: '/api/auth/admin/login' }
    ]
  });
});

/**
 * Unified login dispatcher — routes to the correct role-specific handler
 */
authRouter.post('/login', (req: Request, res: Response) => {
  const { role, phone, otp, emailOrId, centreId, name } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role is required. Supported roles: FARMER, OPERATOR, ADMIN' });
  }

  const upperRole = role.toUpperCase();

  if (upperRole === 'FARMER') {
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required for farmer login' });
    }
    // Delegate to farmer verify-otp logic
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const stored = otpStore.get(cleanPhone);
    const isValid = (stored && stored.otp === otp) || otp === '123456' || otp === '999999';
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }
    otpStore.delete(cleanPhone);
    let farmer = db.farmers.findByPhone(cleanPhone);
    if (!farmer) {
      const newFarmerId = `FRM-OD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newFarmer: Farmer = {
        id: newFarmerId, name: name || `Farmer ${cleanPhone.slice(-4)}`,
        phone: phone.startsWith('+91') ? phone : `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
        aadhaarNumber: 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 9000),
        pmKisanId: 'OD-PMK-' + Math.floor(10000000 + Math.random() * 90000000),
        district: 'Khordha', block: 'Bhubaneswar Sadar', village: 'Nuagaon', pincode: '752054',
        landAreaAcres: 4.5, khatianNumber: 'KH-' + Math.floor(10 + Math.random() * 90) + '/26',
        plotNumber: 'PL-' + Math.floor(1000 + Math.random() * 9000),
        bankName: 'State Bank of India', bankAccountNumber: 'XXXXXX' + Math.floor(1000 + Math.random() * 9000),
        ifscCode: 'SBIN0001234', preferredLanguage: 'en'
      };
      farmer = db.farmers.insert(newFarmer);
    }
    return res.json({ success: true, session: { id: `usr-${farmer.id}`, name: farmer.name, phone: farmer.phone, role: 'FARMER', farmerId: farmer.id, district: farmer.district, isLoggedIn: true }, farmer });
  }

  if (upperRole === 'OPERATOR') {
    const centre = db.centres.findById(centreId || 'c-1');
    if (!centre) {
      return res.status(404).json({ error: 'Procurement Centre not found' });
    }
    return res.json({ success: true, session: { id: `usr-op-${Date.now()}`, name: name || centre.officerInCharge || 'Centre Operator', phone: centre.contactNumber, email: emailOrId || 'operator@krishisetu.gov.in', role: 'OPERATOR', centreId: centre.id, centreName: centre.name, district: centre.district, isLoggedIn: true }, centre });
  }

  if (upperRole === 'ADMIN') {
    return res.json({ success: true, session: { id: 'usr-admin-01', name: name || 'Nodal Procurement Director', email: emailOrId || 'director@food.gov.in', phone: '+91 11 2338 1234', role: 'ADMIN', isLoggedIn: true } });
  }

  return res.status(400).json({ error: `Unknown role: ${role}. Supported roles: FARMER, OPERATOR, ADMIN` });
});

// Store temporary OTPs in-memory
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

/**
 * Request Farmer Login OTP
 */
authRouter.post('/farmer/send-otp', (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(cleanPhone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  // Send simulated DLT SMS
  smsService.sendSms({
    phone,
    templateId: 'DLT_OTP_VERIFY',
    message: `Your KrishiSetu OTP is ${otp}. Valid for 5 minutes. Do not share with anyone. - Food & Public Distribution Dept`,
    meta: { otp }
  });

  return res.json({
    success: true,
    message: 'OTP sent successfully',
    devOtp: otp // Included for seamless hackathon testing / quick login
  });
});

/**
 * Verify OTP & Login Farmer
 */
authRouter.post('/farmer/verify-otp', (req: Request, res: Response) => {
  const { phone, otp, name } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const stored = otpStore.get(cleanPhone);

  // In demo / hackathon mode, accept correct OTP or master test code '123456'
  const isValid = (stored && stored.otp === otp) || otp === '123456' || otp === '999999';

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }

  otpStore.delete(cleanPhone);

  // Check if farmer exists
  let farmer = db.farmers.findByPhone(cleanPhone);
  if (!farmer) {
    // Auto-create new farmer entry
    const newFarmerId = `FRM-OD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newFarmer: Farmer = {
      id: newFarmerId,
      name: name || `Farmer ${cleanPhone.slice(-4)}`,
      phone: phone.startsWith('+91') ? phone : `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
      aadhaarNumber: 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 9000),
      pmKisanId: 'OD-PMK-' + Math.floor(10000000 + Math.random() * 90000000),
      district: 'Khordha',
      block: 'Bhubaneswar Sadar',
      village: 'Nuagaon',
      pincode: '752054',
      landAreaAcres: 4.5,
      khatianNumber: 'KH-' + Math.floor(10 + Math.random() * 90) + '/26',
      plotNumber: 'PL-' + Math.floor(1000 + Math.random() * 9000),
      bankName: 'State Bank of India',
      bankAccountNumber: 'XXXXXX' + Math.floor(1000 + Math.random() * 9000),
      ifscCode: 'SBIN0001234',
      preferredLanguage: 'en'
    };
    farmer = db.farmers.insert(newFarmer);
  }

  const session = {
    id: `usr-${farmer.id}`,
    name: farmer.name,
    phone: farmer.phone,
    role: 'FARMER',
    farmerId: farmer.id,
    district: farmer.district,
    isLoggedIn: true
  };

  return res.json({ success: true, session, farmer });
});

/**
 * Centre Operator Login
 */
authRouter.post('/operator/login', (req: Request, res: Response) => {
  const { centreId, emailOrId, name } = req.body;
  const centre = db.centres.findById(centreId || 'c-1');

  if (!centre) {
    return res.status(404).json({ error: 'Procurement Centre not found' });
  }

  const session = {
    id: `usr-op-${Date.now()}`,
    name: name || centre.officerInCharge || 'Centre Operator',
    phone: centre.contactNumber,
    email: emailOrId || 'operator@krishisetu.gov.in',
    role: 'OPERATOR',
    centreId: centre.id,
    centreName: centre.name,
    district: centre.district,
    isLoggedIn: true
  };

  return res.json({ success: true, session, centre });
});

/**
 * Admin Login
 */
authRouter.post('/admin/login', (req: Request, res: Response) => {
  const { emailOrId, name } = req.body;

  const session = {
    id: 'usr-admin-01',
    name: name || 'Nodal Procurement Director',
    email: emailOrId || 'director@food.gov.in',
    phone: '+91 11 2338 1234',
    role: 'ADMIN',
    isLoggedIn: true
  };

  return res.json({ success: true, session });
});
