export type Language = 'en' | 'hi' | 'or';

export type Role = 'FARMER' | 'OPERATOR' | 'ADMIN';

export type CropType = 
  | 'Paddy (Common)'
  | 'Paddy (Grade A)'
  | 'Wheat (Sharbati)'
  | 'Mustard'
  | 'Groundnut'
  | 'Maize'
  | 'Moong / Green Gram';

export interface CropInfo {
  name: CropType;
  category: 'Kharif' | 'Rabi' | 'Commercial';
  mspRatePerQuintal: number;
  unit: 'Quintal';
  maxMoistureAllowed: number;
  maxForeignMatterAllowed: number;
  iconName: string;
}

export type QualityGrade = 'Grade A' | 'Grade B' | 'FAQ (Fair Average Quality)' | 'Rejected' | 'Pending';

export type QualityResult = 'PASS' | 'FAIL' | 'HOLD';

export type ProcurementStage =
  | 'REGISTRATION_COMPLETED'
  | 'APPLICATION_APPROVED'
  | 'SLOT_ASSIGNED'
  | 'FARMER_ARRIVED'
  | 'QUALITY_CHECK'
  | 'WEIGHING'
  | 'PROCUREMENT_COMPLETE'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_COMPLETED';

export type QueueStatus = 
  | 'Waiting'
  | 'Called'
  | 'Quality Check'
  | 'Weighing'
  | 'Completed'
  | 'Hold'
  | 'Cancelled';

export type CentreStatus = 'NORMAL' | 'BUSY' | 'NEAR CAPACITY' | 'FULL' | 'CLOSED';

export interface ProcurementCentre {
  id: string;
  code: string;
  name: string;
  district: string;
  block: string;
  address: string;
  latitude: number;
  longitude: number;
  dailyCapacity: number; // Quintals
  currentLoad: number; // Quintals
  queueLength: number;
  avgProcessingTimeMinutes: number;
  operatingHours: string;
  status: CentreStatus;
  officerInCharge: string;
  contactNumber: string;
}

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  aadhaarNumber: string; // Masked e.g. XXXX-XXXX-9281
  pmKisanId: string;
  district: string;
  block: string;
  village: string;
  pincode: string;
  landAreaAcres: number;
  khatianNumber: string;
  plotNumber: string;
  bankName: string;
  bankAccountNumber: string; // Masked
  ifscCode: string;
  preferredLanguage: Language;
}

export interface QualityInspection {
  inspectedAt: string;
  inspectorName: string;
  moisturePercentage: number;
  foreignMatterPercentage: number;
  damagedGrainPercentage: number;
  immatureGrainPercentage: number;
  grade: QualityGrade;
  result: QualityResult;
  remarks: string;
}

export interface WeighingRecord {
  weighedAt: string;
  weighbridgeOperator: string;
  vehicleNumber: string;
  vehicleType: string;
  declaredWeight: number; // Quintals
  grossWeight: number; // Quintals
  tareWeight: number; // Quintals
  netWeight: number; // Net = Gross - Tare (Quintals)
  bagCount: number;
  tareWeightSlipNo: string;
}

export type PaymentStatus = 'CALCULATED' | 'INITIATED' | 'PROCESSING' | 'CREDITED' | 'FAILED';

export interface PaymentRecord {
  id: string;
  procurementAmount: number;
  mspRate: number;
  qualityDeductionBonus: number;
  netPayableAmount: number;
  paymentStatus: PaymentStatus;
  dbtBatchNo: string;
  bankRefNo: string;
  utrNumber: string;
  initiatedAt: string;
  creditedAt?: string;
  accountNumberMasked: string;
  bankName: string;
}

export interface TimelineEvent {
  stage: ProcurementStage;
  timestamp: string;
  title: string;
  description: string;
  officer?: string;
}

export interface ProcurementRecord {
  id: string;
  tokenNumber: string; // e.g. PDC-1042
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  centreId: string;
  centreName: string;
  cropType: CropType;
  variety: string;
  declaredQuantity: number; // Quintals
  harvestDate: string;
  slotDate: string;
  slotTime: string;
  bookingTimestamp: string;
  stage: ProcurementStage;
  queueStatus: QueueStatus;
  queuePosition: number;
  estimatedWaitMinutes: number;
  qualityInspection?: QualityInspection;
  weighing?: WeighingRecord;
  payment?: PaymentRecord;
  qrData: string;
  remarks?: string;
  transportMode: string;
  timeline: TimelineEvent[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  role: Role | 'ALL';
  title: string;
  message: string;
  timestamp: string;
  type: 'slot' | 'queue' | 'quality' | 'weighing' | 'payment' | 'system';
  isRead: boolean;
  actionUrl?: string;
}

export interface CentreRecommendation {
  centre: ProcurementCentre;
  distanceKm: number;
  estimatedWaitMinutes: number;
  capacityUtilizationPercent: number;
  score: number; // 0 to 100
  scoreBreakdown: {
    distanceScore: number;
    queueScore: number;
    capacityScore: number;
  };
  recommendationReason: string;
  isBestMatch: boolean;
}

export interface UserSession {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  farmerId?: string;
  centreId?: string;
  district?: string;
  isLoggedIn: boolean;
  avatar?: string;
}
