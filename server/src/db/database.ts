import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Farmer,
  ProcurementCentre,
  ProcurementRecord,
  NotificationItem,
  SmsRecord
} from '../types.js';

// Resolve current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'krishisetu_db.json');

export interface DatabaseSchema {
  centres: ProcurementCentre[];
  farmers: Farmer[];
  procurements: ProcurementRecord[];
  notifications: NotificationItem[];
  smsLogs: SmsRecord[];
  meta: {
    lastUpdated: string;
    version: string;
  };
}

class Database {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.centres && parsed.farmers && parsed.procurements) {
          return parsed;
        }
      } catch (err) {
        console.error('Failed to parse database file, reinitializing with defaults', err);
      }
    }

    // Default Seed Dataset
    const seed = this.createDefaultSeed();
    this.persistSync(seed);
    return seed;
  }

  private persistSync(data: DatabaseSchema) {
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  }

  public save() {
    this.data.meta.lastUpdated = new Date().toISOString();
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      try {
        this.persistSync(this.data);
      } catch (err) {
        console.error('Failed to persist database to file:', err);
      }
    }, 100);
  }

  // Repository Accessors
  public get centres() {
    return {
      find: (predicate?: (c: ProcurementCentre) => boolean) =>
        predicate ? this.data.centres.filter(predicate) : [...this.data.centres],
      findById: (id: string) => this.data.centres.find(c => c.id === id || c.code === id),
      insert: (centre: ProcurementCentre) => {
        this.data.centres.push(centre);
        this.save();
        return centre;
      },
      update: (id: string, updates: Partial<ProcurementCentre>) => {
        const idx = this.data.centres.findIndex(c => c.id === id || c.code === id);
        if (idx !== -1) {
          this.data.centres[idx] = { ...this.data.centres[idx], ...updates };
          this.save();
          return this.data.centres[idx];
        }
        return null;
      }
    };
  }

  public get farmers() {
    return {
      find: (predicate?: (f: Farmer) => boolean) =>
        predicate ? this.data.farmers.filter(predicate) : [...this.data.farmers],
      findById: (id: string) => this.data.farmers.find(f => f.id === id),
      findByPhone: (phone: string) => {
        const clean = phone.replace(/[^0-9]/g, '');
        return this.data.farmers.find(f => f.phone.replace(/[^0-9]/g, '').includes(clean));
      },
      insert: (farmer: Farmer) => {
        this.data.farmers.push(farmer);
        this.save();
        return farmer;
      },
      update: (id: string, updates: Partial<Farmer>) => {
        const idx = this.data.farmers.findIndex(f => f.id === id);
        if (idx !== -1) {
          this.data.farmers[idx] = { ...this.data.farmers[idx], ...updates };
          this.save();
          return this.data.farmers[idx];
        }
        return null;
      }
    };
  }

  public get procurements() {
    return {
      find: (predicate?: (p: ProcurementRecord) => boolean) =>
        predicate ? this.data.procurements.filter(predicate) : [...this.data.procurements],
      findById: (id: string) => this.data.procurements.find(p => p.id === id || p.tokenNumber === id),
      insert: (proc: ProcurementRecord) => {
        this.data.procurements.unshift(proc);
        this.save();
        return proc;
      },
      update: (id: string, updates: Partial<ProcurementRecord>) => {
        const idx = this.data.procurements.findIndex(p => p.id === id || p.tokenNumber === id);
        if (idx !== -1) {
          this.data.procurements[idx] = { ...this.data.procurements[idx], ...updates };
          this.save();
          return this.data.procurements[idx];
        }
        return null;
      },
      delete: (id: string) => {
        const initialLen = this.data.procurements.length;
        this.data.procurements = this.data.procurements.filter(p => p.id !== id && p.tokenNumber !== id);
        const removed = this.data.procurements.length < initialLen;
        if (removed) this.save();
        return removed;
      }
    };
  }

  public get notifications() {
    return {
      find: (predicate?: (n: NotificationItem) => boolean) =>
        predicate ? this.data.notifications.filter(predicate) : [...this.data.notifications],
      findById: (id: string) => this.data.notifications.find(n => n.id === id),
      insert: (item: NotificationItem) => {
        this.data.notifications.unshift(item);
        this.save();
        return item;
      },
      update: (id: string, updates: Partial<NotificationItem>) => {
        const idx = this.data.notifications.findIndex(n => n.id === id);
        if (idx !== -1) {
          this.data.notifications[idx] = { ...this.data.notifications[idx], ...updates };
          this.save();
          return this.data.notifications[idx];
        }
        return null;
      },
      markAllAsRead: (userId?: string) => {
        this.data.notifications = this.data.notifications.map(n =>
          (!userId || n.userId === userId || n.userId === 'ALL') ? { ...n, isRead: true } : n
        );
        this.save();
      }
    };
  }

  public get smsLogs() {
    return {
      find: (predicate?: (s: SmsRecord) => boolean) =>
        predicate ? this.data.smsLogs.filter(predicate) : [...this.data.smsLogs],
      insert: (record: SmsRecord) => {
        this.data.smsLogs.unshift(record);
        this.save();
        return record;
      }
    };
  }

  public resetToDefaults() {
    this.data = this.createDefaultSeed();
    this.persistSync(this.data);
  }

  private createDefaultSeed(): DatabaseSchema {
    const defaultCentres: ProcurementCentre[] = [
      {
        id: 'c-1',
        code: 'DPC-01',
        name: 'Digha Central Procurement Centre',
        district: 'Khordha',
        block: 'Bhubaneswar Sadar',
        address: 'NH-16 Mandi Complex, Digha Agro Yard, Khordha, 752054',
        latitude: 20.2520,
        longitude: 85.7890,
        dailyCapacity: 600,
        currentLoad: 385,
        queueLength: 8,
        avgProcessingTimeMinutes: 7,
        operatingHours: '08:00 AM - 06:00 PM',
        status: 'BUSY',
        officerInCharge: 'Rajesh Sharma (Senior Agri Officer)',
        contactNumber: '+91 94370 12345'
      },
      {
        id: 'c-2',
        code: 'SMC-02',
        name: 'Sambalpur Regulated Market Yard',
        district: 'Sambalpur',
        block: 'Dhankauda',
        address: 'RMC Yard, Farm Road, Khetrajpur, Sambalpur, 768003',
        latitude: 21.4669,
        longitude: 83.9812,
        dailyCapacity: 800,
        currentLoad: 420,
        queueLength: 5,
        avgProcessingTimeMinutes: 8,
        operatingHours: '08:30 AM - 06:30 PM',
        status: 'NORMAL',
        officerInCharge: 'Manoj Das (Mandi Inspector)',
        contactNumber: '+91 94371 67890'
      },
      {
        id: 'c-3',
        code: 'BMC-03',
        name: 'Bargarh Paddy Depot & Mandi',
        district: 'Bargarh',
        block: 'Attabira',
        address: 'State Warehouse Road, Godown Sector, Bargarh, 768028',
        latitude: 21.3320,
        longitude: 83.6210,
        dailyCapacity: 950,
        currentLoad: 890,
        queueLength: 14,
        avgProcessingTimeMinutes: 6,
        operatingHours: '07:30 AM - 07:00 PM',
        status: 'NEAR CAPACITY',
        officerInCharge: 'Soumya Ranjan Pradhan',
        contactNumber: '+91 94372 11223'
      },
      {
        id: 'c-4',
        code: 'CKH-04',
        name: 'Cuttack Krishi Vikash Hub',
        district: 'Cuttack',
        block: 'Choudwar',
        address: 'Agro Industrial Corridor, OMP Square Extension, Cuttack, 753003',
        latitude: 20.4625,
        longitude: 85.8828,
        dailyCapacity: 500,
        currentLoad: 210,
        queueLength: 3,
        avgProcessingTimeMinutes: 9,
        operatingHours: '08:00 AM - 05:30 PM',
        status: 'NORMAL',
        officerInCharge: 'Priyabrata Mohapatra',
        contactNumber: '+91 94373 44556'
      },
      {
        id: 'c-5',
        code: 'BGD-05',
        name: 'Balasore Coastal Grain Depot',
        district: 'Balasore',
        block: 'Remuna',
        address: 'Remuna Mandi bypass, Near Cold Storage Complex, Balasore, 756019',
        latitude: 21.5034,
        longitude: 86.9250,
        dailyCapacity: 450,
        currentLoad: 430,
        queueLength: 11,
        avgProcessingTimeMinutes: 7,
        operatingHours: '08:00 AM - 06:00 PM',
        status: 'NEAR CAPACITY',
        officerInCharge: 'Deepak Kumar Swain',
        contactNumber: '+91 94374 99887'
      }
    ];

    const defaultFarmers: Farmer[] = [
      {
        id: 'FRM-OD-2026-8812',
        name: 'Ramesh Kumar',
        phone: '+91 98765 43210',
        aadhaarNumber: 'XXXX-XXXX-9281',
        pmKisanId: 'OD-PMK-77291034',
        district: 'Khordha',
        block: 'Bhubaneswar Sadar',
        village: 'Nuagaon',
        pincode: '752054',
        landAreaAcres: 4.8,
        khatianNumber: 'KH-142/90',
        plotNumber: 'PL-3829, PL-3830',
        bankName: 'State Bank of India',
        bankAccountNumber: 'XXXXXX4921',
        ifscCode: 'SBIN0001234',
        preferredLanguage: 'en'
      },
      {
        id: 'FRM-OD-2026-8813',
        name: 'Sunita Devi',
        phone: '+91 98765 43211',
        aadhaarNumber: 'XXXX-XXXX-4421',
        pmKisanId: 'OD-PMK-77291035',
        district: 'Sambalpur',
        block: 'Dhankauda',
        village: 'Kudapali',
        pincode: '768003',
        landAreaAcres: 3.5,
        khatianNumber: 'KH-88/12',
        plotNumber: 'PL-1102',
        bankName: 'Punjab National Bank',
        bankAccountNumber: 'XXXXXX8812',
        ifscCode: 'PUNB0123400',
        preferredLanguage: 'hi'
      },
      {
        id: 'FRM-OD-2026-8814',
        name: 'Bijay Mohanty',
        phone: '+91 98765 43212',
        aadhaarNumber: 'XXXX-XXXX-1982',
        pmKisanId: 'OD-PMK-77291036',
        district: 'Khordha',
        block: 'Jatni',
        village: 'Khurda Road',
        pincode: '752050',
        landAreaAcres: 6.2,
        khatianNumber: 'KH-201/44',
        plotNumber: 'PL-5519',
        bankName: 'UCO Bank',
        bankAccountNumber: 'XXXXXX3319',
        ifscCode: 'UCBA0000981',
        preferredLanguage: 'or'
      }
    ];

    const defaultProcurements: ProcurementRecord[] = [
      {
        id: 'proc-1042',
        tokenNumber: 'PDC-1042',
        farmerId: 'FRM-OD-2026-8812',
        farmerName: 'Ramesh Kumar',
        farmerPhone: '+91 98765 43210',
        centreId: 'c-1',
        centreName: 'Digha Central Procurement Centre',
        cropType: 'Paddy (Common)',
        variety: 'Swarna (MTU 7029)',
        declaredQuantity: 45,
        harvestDate: '2026-09-12',
        slotDate: '2026-09-19',
        slotTime: '10:00 - 11:00 AM',
        bookingTimestamp: '2026-09-14T09:30:00.000Z',
        stage: 'FARMER_ARRIVED',
        queueStatus: 'Called',
        queuePosition: 1,
        estimatedWaitMinutes: 5,
        transportMode: 'Tractor Trolley (OD-02-BQ-4412)',
        qrData: 'KRISHISETU:PDC-1042:FRM-OD-2026-8812:DPC-01:45QTL:PADDY',
        remarks: 'Vehicle at Mandi Inward Gate. Token ready for inspection.',
        timeline: [
          { stage: 'REGISTRATION_COMPLETED', timestamp: '2026-09-14 09:30 AM', title: 'Crop Registered', description: '45 Quintals Paddy registered.' },
          { stage: 'APPLICATION_APPROVED', timestamp: '2026-09-14 11:00 AM', title: 'Land & Aadhaar Verified', description: 'Auto-verified with Krishi Odisha.' },
          { stage: 'SLOT_ASSIGNED', timestamp: '2026-09-14 11:05 AM', title: 'Slot Confirmed', description: 'Token PDC-1042 generated.' },
          { stage: 'FARMER_ARRIVED', timestamp: '2026-09-19 09:50 AM', title: 'Gate Inward Checkin', description: 'Arrival validated by Mandi Gate Scanner.' }
        ]
      },
      {
        id: 'proc-1043',
        tokenNumber: 'PDC-1043',
        farmerId: 'FRM-OD-2026-8814',
        farmerName: 'Bijay Mohanty',
        farmerPhone: '+91 98765 43212',
        centreId: 'c-1',
        centreName: 'Digha Central Procurement Centre',
        cropType: 'Paddy (Grade A)',
        variety: 'Pooja (CR 1009)',
        declaredQuantity: 60,
        harvestDate: '2026-09-14',
        slotDate: '2026-09-19',
        slotTime: '11:00 - 12:00 PM',
        bookingTimestamp: '2026-09-15T08:00:00.000Z',
        stage: 'SLOT_ASSIGNED',
        queueStatus: 'Waiting',
        queuePosition: 2,
        estimatedWaitMinutes: 20,
        transportMode: 'Mini Truck (OD-02-X-9901)',
        qrData: 'KRISHISETU:PDC-1043:FRM-OD-2026-8814:DPC-01:60QTL:PADDY',
        timeline: [
          { stage: 'REGISTRATION_COMPLETED', timestamp: '2026-09-15 08:00 AM', title: 'Crop Registered', description: '60 Quintals Grade A registered.' },
          { stage: 'SLOT_ASSIGNED', timestamp: '2026-09-15 09:00 AM', title: 'Slot Confirmed', description: 'Slot scheduled for 11:00 AM.' }
        ]
      }
    ];

    const defaultNotifications: NotificationItem[] = [
      {
        id: 'notif-1',
        userId: 'FRM-OD-2026-8812',
        role: 'FARMER',
        title: 'Token Called - Proceed to Quality Bay 1',
        message: 'Your token PDC-1042 is now called! Please move your tractor to Quality Inspection Bay #1.',
        timestamp: new Date().toISOString(),
        type: 'queue',
        isRead: false,
        actionUrl: '/farmer/queue'
      },
      {
        id: 'notif-2',
        userId: 'ALL',
        role: 'ALL',
        title: 'Mandi Procurement Portal Live',
        message: 'Welcome to KrishiSetu Real-Time Smart Mandi Procurement System (SIH26032).',
        timestamp: new Date().toISOString(),
        type: 'system',
        isRead: false
      }
    ];

    const defaultSmsLogs: SmsRecord[] = [
      {
        id: 'SMS-INIT-01',
        recipientPhone: '+91 98765 43210',
        senderId: 'VM-KRISHI',
        templateId: 'DLT_SLOT_BOOKED',
        message: 'Dear Ramesh Kumar, your mandi procurement slot is CONFIRMED for 2026-09-19 at 10:00 - 11:00 AM. Token: PDC-1042 at Digha Central Procurement Centre. - Food & Public Distribution Dept',
        status: 'DELIVERED',
        sentAt: '2026-09-14T09:35:00.000Z'
      }
    ];

    return {
      centres: defaultCentres,
      farmers: defaultFarmers,
      procurements: defaultProcurements,
      notifications: defaultNotifications,
      smsLogs: defaultSmsLogs,
      meta: {
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }
}

export const db = new Database();
