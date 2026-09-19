import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Role,
  Farmer,
  ProcurementCentre,
  ProcurementRecord,
  NotificationItem,
  QualityGrade,
  QualityResult,
  CentreStatus,
  QueueStatus,
  CropType,
  PaymentRecord,
  UserSession
} from '../types';
import {
  INITIAL_CENTRES,
  INITIAL_FARMERS,
  INITIAL_PROCUREMENTS,
  INITIAL_NOTIFICATIONS,
  CROPS_CATALOGUE
} from '../data/mockData';
import { generateToken, generateId } from '../utils/formatters';
import { api } from '../services/api';

interface AppStateContextType {
  role: Role;
  setRole: (role: Role) => void;
  activeFarmer: Farmer;
  setActiveFarmerId: (id: string) => void;
  activeCentreId: string;
  setActiveCentreId: (id: string) => void;

  currentUser: UserSession | null;
  isAuthenticated: boolean;
  loginFarmer: (params: { phone: string; name?: string; email?: string }) => Farmer;
  registerFarmer: (data: Partial<Farmer> & { name: string; phone: string }) => Farmer;
  loginOperator: (params: { emailOrId: string; centreId: string; name?: string }) => void;
  loginAdmin: (params: { emailOrId: string; name?: string }) => void;
  logout: () => void;

  farmers: Farmer[];
  centres: ProcurementCentre[];
  procurements: ProcurementRecord[];
  notifications: NotificationItem[];

  connectionStatus: 'online' | 'weak' | 'offline';
  setConnectionStatus: (status: 'online' | 'weak' | 'offline') => void;
  lastSyncTime: Date;
  syncNow: () => void;

  registerAndBookSlot: (data: {
    farmerId: string;
    centreId: string;
    cropType: CropType;
    variety: string;
    declaredQuantity: number;
    harvestDate: string;
    slotDate: string;
    slotTime: string;
    transportMode: string;
  }) => ProcurementRecord;

  updateSlotBooking: (
    procurementId: string,
    data: Partial<{
      cropType: CropType;
      variety: string;
      declaredQuantity: number;
      centreId: string;
      slotDate: string;
      slotTime: string;
      transportMode: string;
      harvestDate: string;
    }>
  ) => Promise<ProcurementRecord | undefined>;

  cancelSlot: (procurementId: string, reason?: string) => Promise<void>;
  callFarmer: (procurementId: string) => void;
  gateCheckin: (tokenOrQr: string) => Promise<boolean>;
  updateQueueStatus: (procurementId: string, status: QueueStatus) => void;
  releaseDbtPayment: (procurementId: string, utrNumber?: string) => Promise<boolean>;
  submitQualityCheck: (
    procurementId: string,
    data: {
      moisturePercentage: number;
      foreignMatterPercentage: number;
      damagedGrainPercentage: number;
      immatureGrainPercentage: number;
      grade: QualityGrade;
      result: QualityResult;
      remarks: string;
      inspectorName: string;
      aiVerified?: boolean;
      aiConfidence?: number;
    }
  ) => void;

  submitWeighing: (
    procurementId: string,
    data: {
      grossWeight: number;
      tareWeight: number;
      bagCount: number;
      vehicleNumber: string;
      operatorName: string;
    }
  ) => void;

  completeProcurement: (procurementId: string, remarks?: string) => void;
  updateCentreCapacity: (centreId: string, newDailyCapacity: number, newStatus?: CentreStatus) => void;
  updateCentre: (centreId: string, data: Partial<ProcurementCentre>) => void;
  addCentre: (newCentre: Omit<ProcurementCentre, 'id' | 'queueLength' | 'currentLoad'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  resetDemoData: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FARMERS: 'krishisetu_farmers_v1',
  CENTRES: 'krishisetu_centres_v1',
  PROCUREMENTS: 'krishisetu_procurements_v1',
  NOTIFICATIONS: 'krishisetu_notifications_v1',
  ACTIVE_FARMER: 'krishisetu_active_farmer_id',
  ACTIVE_CENTRE: 'krishisetu_active_centre_id',
  ROLE: 'krishisetu_active_role',
  USER_SESSION: 'krishisetu_user_session_v1'
};

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as Role) || 'FARMER';
  });

  const [activeFarmerId, setActiveFarmerIdState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_FARMER) || 'FRM-OD-2026-8812';
  });

  const [activeCentreId, setActiveCentreIdState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CENTRE) || 'c-1';
  });

  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return {
      id: 'usr-farmer-1042',
      name: 'Ramesh Kumar',
      phone: '9876543210',
      email: 'ramesh.farmer@agri.in',
      role: 'FARMER',
      farmerId: 'FRM-OD-2026-8812',
      district: 'Bargarh',
      isLoggedIn: true
    };
  });

  const isAuthenticated = !!currentUser && currentUser.isLoggedIn;

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    }
  }, [currentUser]);

  const [farmers, setFarmers] = useState<Farmer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FARMERS);
    return saved ? JSON.parse(saved) : INITIAL_FARMERS;
  });

  const [centres, setCentres] = useState<ProcurementCentre[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CENTRES);
    return saved ? JSON.parse(saved) : INITIAL_CENTRES;
  });

  const [procurements, setProcurements] = useState<ProcurementRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROCUREMENTS);
    return saved ? JSON.parse(saved) : INITIAL_PROCUREMENTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [connectionStatus, setConnectionStatus] = useState<'online' | 'weak' | 'offline'>('online');
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(farmers));
  }, [farmers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CENTRES, JSON.stringify(centres));
  }, [centres]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROCUREMENTS, JSON.stringify(procurements));
  }, [procurements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PROCUREMENTS && e.newValue) {
        setProcurements(JSON.parse(e.newValue));
      }
      if (e.key === STORAGE_KEYS.CENTRES && e.newValue) {
        setCentres(JSON.parse(e.newValue));
      }
      if (e.key === STORAGE_KEYS.NOTIFICATIONS && e.newValue) {
        setNotifications(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Sync with real backend server and subscribe to Real-Time SSE Stream
  useEffect(() => {
    api.checkHealth().then(isOnline => {
      if (isOnline) {
        setConnectionStatus('online');
        Promise.all([
          api.getCentres(),
          api.getFarmers(),
          api.getProcurements(),
          api.getNotifications()
        ]).then(([cList, fList, pList, nList]) => {
          if (cList && cList.length) setCentres(cList);
          if (fList && fList.length) setFarmers(fList);
          if (pList && pList.length) setProcurements(pList);
          if (nList && nList.length) setNotifications(nList);
        }).catch(err => console.warn('Initial backend sync error:', err));
      }
    });

    const unsubscribe = api.subscribeEvents((event) => {
      const { type, payload } = event;
      if (type === 'TOKEN_CALLED') {
        const pData = (payload as any)?.procurement;
        if (pData) {
          setProcurements(prev => prev.map(p => p.id === pData.id ? pData : p));
        }
        if ('speechSynthesis' in window && (payload as any)?.tokenNumber) {
          try {
            const announcement = `Attention. Token ${(payload as any).tokenNumber} has been called to ${(payload as any).bayNumber || 'Inspection Bay 1'}.`;
            const utterance = new SpeechSynthesisUtterance(announcement);
            utterance.rate = 0.95;
            window.speechSynthesis.speak(utterance);
          } catch (e) {
            console.warn('Speech synthesis error:', e);
          }
        }
      } else if (
        type === 'QUEUE_UPDATED' ||
        type === 'GATE_CHECKIN' ||
        type === 'QUALITY_SUBMITTED' ||
        type === 'WEIGHING_SUBMITTED' ||
        type === 'PROCUREMENT_COMPLETED'
      ) {
        const pData = (payload as any)?.procurement;
        if (pData) {
          setProcurements(prev => {
            const exists = prev.some(p => p.id === pData.id);
            return exists ? prev.map(p => p.id === pData.id ? pData : p) : [pData, ...prev];
          });
        }
      } else if (type === 'CENTRE_CAPACITY_UPDATED') {
        const centreData = payload as ProcurementCentre;
        if (centreData) {
          setCentres(prev => prev.map(c => c.id === centreData.id ? { ...c, ...centreData } : c));
        }
      } else if (type === 'NOTIFICATION_SENT') {
        api.getNotifications().then(nList => {
          if (nList) setNotifications(nList);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    localStorage.setItem(STORAGE_KEYS.ROLE, newRole);
  };

  const setActiveFarmerId = (id: string) => {
    setActiveFarmerIdState(id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_FARMER, id);
  };

  const setActiveCentreId = (id: string) => {
    setActiveCentreIdState(id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CENTRE, id);
  };

  const activeFarmer = farmers.find(f => f.id === activeFarmerId) || farmers[0];

  const syncNow = useCallback(() => {
    setLastSyncTime(new Date());
  }, []);

  const registerAndBookSlot = (data: {
    farmerId: string;
    centreId: string;
    cropType: CropType;
    variety: string;
    declaredQuantity: number;
    harvestDate: string;
    slotDate: string;
    slotTime: string;
    transportMode: string;
  }): ProcurementRecord => {
    const centre = centres.find(c => c.id === data.centreId) || centres[0];
    const farmer = farmers.find(f => f.id === data.farmerId) || activeFarmer;

    const tokenPrefix = data.cropType.includes('Wheat') ? 'WHT' : data.cropType.includes('Mustard') ? 'MST' : 'PDC';
    const tokenNumber = generateToken(tokenPrefix);
    const newId = generateId('proc');
    const nowISO = new Date().toISOString();

    const newRecord: ProcurementRecord = {
      id: newId,
      tokenNumber,
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerPhone: farmer.phone,
      centreId: centre.id,
      centreName: centre.name,
      cropType: data.cropType,
      variety: data.variety,
      declaredQuantity: data.declaredQuantity,
      harvestDate: data.harvestDate,
      slotDate: data.slotDate,
      slotTime: data.slotTime,
      bookingTimestamp: nowISO,
      stage: 'SLOT_ASSIGNED',
      queueStatus: 'Waiting',
      queuePosition: centre.queueLength + 1,
      estimatedWaitMinutes: (centre.queueLength + 1) * centre.avgProcessingTimeMinutes,
      transportMode: data.transportMode,
      qrData: `KRISHISETU:${tokenNumber}:${farmer.id}:${centre.code}:${data.declaredQuantity}QTL:${data.cropType}`,
      timeline: [
        {
          stage: 'REGISTRATION_COMPLETED',
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
          title: 'Crop Registration Completed',
          description: `${data.declaredQuantity} Quintals of ${data.cropType} (${data.variety}) registered online.`
        },
        {
          stage: 'APPLICATION_APPROVED',
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
          title: 'Application Approved',
          description: `Land record verified for Khata #${farmer.khatianNumber}.`
        },
        {
          stage: 'SLOT_ASSIGNED',
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
          title: 'Slot Confirmed & Token Issued',
          description: `Allocated for ${data.slotDate} at ${data.slotTime}. Token #${tokenNumber}.`
        }
      ]
    };

    setCentres(prev =>
      prev.map(c => {
        if (c.id === centre.id) {
          const newQueue = c.queueLength + 1;
          const newLoad = c.currentLoad + data.declaredQuantity;
          const status: CentreStatus = newLoad >= c.dailyCapacity ? 'FULL' : newLoad >= c.dailyCapacity * 0.85 ? 'NEAR CAPACITY' : newQueue > 6 ? 'BUSY' : 'NORMAL';
          return { ...c, queueLength: newQueue, currentLoad: newLoad, status };
        }
        return c;
      })
    );

    setProcurements(prev => [newRecord, ...prev]);

    const newNotif: NotificationItem = {
      id: generateId('notif'),
      userId: farmer.id,
      role: 'FARMER',
      title: `Slot Confirmed: Token #${tokenNumber}`,
      message: `Your procurement slot is confirmed at ${centre.name} for ${data.slotDate} (${data.slotTime}).`,
      timestamp: nowISO,
      type: 'slot',
      isRead: false,
      actionUrl: '/farmer/my-slot'
    };

    const operatorNotif: NotificationItem = {
      id: generateId('notif'),
      userId: 'operator',
      role: 'OPERATOR',
      title: `New Slot Booked: ${tokenNumber}`,
      message: `${farmer.name} booked ${data.declaredQuantity} Qtl ${data.cropType} for ${data.slotDate}.`,
      timestamp: nowISO,
      type: 'slot',
      isRead: false,
      actionUrl: '/centre/queue'
    };

    setNotifications(prev => [newNotif, operatorNotif, ...prev]);
    setLastSyncTime(new Date());

    return newRecord;
  };

  const updateSlotBooking = async (
    procurementId: string,
    data: Partial<{
      cropType: CropType;
      variety: string;
      declaredQuantity: number;
      centreId: string;
      slotDate: string;
      slotTime: string;
      transportMode: string;
      harvestDate: string;
    }>
  ): Promise<ProcurementRecord | undefined> => {
    try {
      const updatedBackend = await api.updateSlotBooking(procurementId, data);
      if (updatedBackend) {
        setProcurements(prev => prev.map(p => p.id === updatedBackend.id ? updatedBackend : p));
        api.getCentres().then(cList => { if (cList?.length) setCentres(cList); }).catch(() => {});
        setLastSyncTime(new Date());
        return updatedBackend;
      }
    } catch (e) {
      console.warn('Backend updateSlotBooking failed, updating locally:', e);
    }

    // Local fallback update
    let updatedRecord: ProcurementRecord | undefined;
    setProcurements(prev =>
      prev.map(p => {
        if (p.id === procurementId) {
          const newCentre = centres.find(c => c.id === (data.centreId || p.centreId)) || centres[0];
          const newCrop = (data.cropType || p.cropType) as CropType;
          const newQty = data.declaredQuantity !== undefined ? Number(data.declaredQuantity) : p.declaredQuantity;
          const newVariety = data.variety || p.variety;
          const newSlotDate = data.slotDate || p.slotDate;
          const newSlotTime = data.slotTime || p.slotTime;
          const newTransport = data.transportMode || p.transportMode;
          const newHarvest = data.harvestDate || p.harvestDate;

          const qrData = `KRISHISETU:${p.tokenNumber}:${p.farmerId}:${newCentre.code}:${newQty}QTL:${newCrop.toUpperCase()}`;
          const note = `Edited within 1-min grace window: ${newCrop} (${newVariety}), ${newQty} Qtl at ${newCentre.name}, Date: ${newSlotDate} (${newSlotTime}).`;

          updatedRecord = {
            ...p,
            cropType: newCrop,
            variety: newVariety,
            declaredQuantity: newQty,
            centreId: newCentre.id,
            centreName: newCentre.name,
            slotDate: newSlotDate,
            slotTime: newSlotTime,
            transportMode: newTransport,
            harvestDate: newHarvest,
            qrData,
            timeline: [
              ...p.timeline,
              {
                stage: p.stage,
                timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
                title: 'Booking Details Modified (1-Min Window)',
                description: note
              }
            ]
          };
          return updatedRecord;
        }
        return p;
      })
    );

    // Update centre loads locally
    const target = procurements.find(p => p.id === procurementId);
    if (target) {
      const oldCentreId = target.centreId;
      const newCentreId = data.centreId || oldCentreId;
      const newQty = data.declaredQuantity !== undefined ? Number(data.declaredQuantity) : target.declaredQuantity;

      setCentres(prev =>
        prev.map(c => {
          if (oldCentreId === newCentreId && c.id === oldCentreId) {
            const diff = newQty - target.declaredQuantity;
            return { ...c, currentLoad: Math.max(0, c.currentLoad + diff) };
          }
          if (c.id === oldCentreId) {
            return {
              ...c,
              queueLength: Math.max(0, c.queueLength - 1),
              currentLoad: Math.max(0, c.currentLoad - target.declaredQuantity)
            };
          }
          if (c.id === newCentreId) {
            return {
              ...c,
              queueLength: c.queueLength + 1,
              currentLoad: c.currentLoad + newQty
            };
          }
          return c;
        })
      );
    }

    setLastSyncTime(new Date());
    return updatedRecord;
  };

  const cancelSlot = async (procurementId: string, reason?: string) => {
    try {
      await api.cancelSlot(procurementId, reason);
    } catch (e) {
      console.warn('Backend cancelSlot error, proceeding locally:', e);
    }

    setProcurements(prev =>
      prev.map(p => {
        if (p.id === procurementId) {
          return {
            ...p,
            queueStatus: 'Cancelled',
            timeline: [
              ...p.timeline,
              {
                stage: p.stage,
                timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
                title: 'Slot Cancelled',
                description: reason || 'Slot cancelled by farmer during grace window.'
              }
            ]
          };
        }
        return p;
      })
    );

    const target = procurements.find(p => p.id === procurementId);
    if (target) {
      setCentres(prev =>
        prev.map(c => {
          if (c.id === target.centreId) {
            return {
              ...c,
              queueLength: Math.max(0, c.queueLength - 1),
              currentLoad: Math.max(0, c.currentLoad - target.declaredQuantity)
            };
          }
          return c;
        })
      );
    }
    setLastSyncTime(new Date());
  };

  const callFarmer = (procurementId: string) => {
    setProcurements(prev =>
      prev.map(p => {
        if (p.id === procurementId) {
          const nowFormatted = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
          return {
            ...p,
            stage: 'FARMER_ARRIVED',
            queueStatus: 'Called',
            timeline: [
              ...p.timeline,
              {
                stage: 'FARMER_ARRIVED',
                timestamp: nowFormatted,
                title: 'Called to Mandi Gate',
                description: 'Mandi operator called token to Inspection Bay 1.'
              }
            ]
          };
        }
        return p;
      })
    );

    const target = procurements.find(p => p.id === procurementId);
    if (target) {
      const notif: NotificationItem = {
        id: generateId('notif'),
        userId: target.farmerId,
        role: 'FARMER',
        title: `Gate Call: Token #${target.tokenNumber}`,
        message: `Your token #${target.tokenNumber} has been CALLED to Inspection Bay 1. Please proceed immediately.`,
        timestamp: new Date().toISOString(),
        type: 'queue',
        isRead: false,
        actionUrl: '/farmer/status'
      };
      setNotifications(prev => [notif, ...prev]);
    }
    setLastSyncTime(new Date());
  };

  const updateQueueStatus = (procurementId: string, status: QueueStatus) => {
    setProcurements(prev =>
      prev.map(p => {
        if (p.id === procurementId) {
          return { ...p, queueStatus: status };
        }
        return p;
      })
    );
    setLastSyncTime(new Date());
  };

  const submitQualityCheck = (
    procurementId: string,
    data: {
      moisturePercentage: number;
      foreignMatterPercentage: number;
      damagedGrainPercentage: number;
      immatureGrainPercentage: number;
      grade: QualityGrade;
      result: QualityResult;
      remarks: string;
      inspectorName: string;
      aiVerified?: boolean;
      aiConfidence?: number;
    }
  ) => {
    const nowISO = new Date().toISOString();
    const nowFormatted = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });

    setProcurements(prev =>
      prev.map(p => {
        if (p.id === procurementId) {
          const nextStage = data.result === 'PASS' ? 'QUALITY_CHECK' : p.stage;
          const nextQueueStatus: QueueStatus = data.result === 'PASS' ? 'Quality Check' : data.result === 'HOLD' ? 'Hold' : 'Cancelled';

          return {
            ...p,
            stage: nextStage,
            queueStatus: nextQueueStatus,
            qualityInspection: {
              inspectedAt: nowISO,
              inspectorName: data.inspectorName,
              moisturePercentage: data.moisturePercentage,
              foreignMatterPercentage: data.foreignMatterPercentage,
              damagedGrainPercentage: data.damagedGrainPercentage,
              immatureGrainPercentage: data.immatureGrainPercentage,
              grade: data.grade,
              result: data.result,
              remarks: data.remarks,
              aiVerified: data.aiVerified,
              aiConfidence: data.aiConfidence
            },
            timeline: [
              ...p.timeline,
              {
                stage: 'QUALITY_CHECK',
                timestamp: nowFormatted,
                title: `Quality Inspection: ${data.result} (${data.grade})`,
                description: `Moisture: ${data.moisturePercentage}%, Foreign Matter: ${data.foreignMatterPercentage}%. ${data.remarks}`,
                officer: data.inspectorName
              }
            ]
          };
        }
        return p;
      })
    );

    const target = procurements.find(p => p.id === procurementId);
    if (target) {
      const notif: NotificationItem = {
        id: generateId('notif'),
        userId: target.farmerId,
        role: 'FARMER',
        title: `Quality Check Result: ${data.result}`,
        message: `Token #${target.tokenNumber} awarded ${data.grade} with ${data.moisturePercentage}% moisture. ${data.result === 'PASS' ? 'Proceeding to Weighbridge.' : 'Action required.'}`,
        timestamp: nowISO,
        type: 'quality',
        isRead: false,
        actionUrl: '/farmer/status'
      };
      setNotifications(prev => [notif, ...prev]);
    }
    setLastSyncTime(new Date());
  };

  const submitWeighing = (
    procurementId: string,
    data: {
      grossWeight: number;
      tareWeight: number;
      bagCount: number;
      vehicleNumber: string;
      operatorName: string;
    }
  ) => {
    const netWeight = Math.round((data.grossWeight - data.tareWeight) * 100) / 100;
    const nowISO = new Date().toISOString();
    const nowFormatted = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
    const slipNo = `WB-SLIP-${Math.floor(100000 + Math.random() * 900000)}`;

    setProcurements(prev =>
      prev.map(p => {
        if (p.id === procurementId) {
          return {
            ...p,
            stage: 'WEIGHING',
            queueStatus: 'Weighing',
            weighing: {
              weighedAt: nowISO,
              weighbridgeOperator: data.operatorName,
              vehicleNumber: data.vehicleNumber,
              vehicleType: 'Commercial Goods Vehicle',
              declaredWeight: p.declaredQuantity,
              grossWeight: data.grossWeight,
              tareWeight: data.tareWeight,
              netWeight: netWeight,
              bagCount: data.bagCount,
              tareWeightSlipNo: slipNo
            },
            timeline: [
              ...p.timeline,
              {
                stage: 'WEIGHING',
                timestamp: nowFormatted,
                title: 'Digital Weighbridge Verified',
                description: `Gross: ${data.grossWeight} Qtl | Tare: ${data.tareWeight} Qtl | Verified Net: ${netWeight} Qtl (${data.bagCount} bags). Slip #${slipNo}`,
                officer: data.operatorName
              }
            ]
          };
        }
        return p;
      })
    );

    const target = procurements.find(p => p.id === procurementId);
    if (target) {
      const notif: NotificationItem = {
        id: generateId('notif'),
        userId: target.farmerId,
        role: 'FARMER',
        title: `Weighing Completed: ${netWeight} Qtl`,
        message: `Net weight verified at ${netWeight} Quintals (${data.bagCount} standard bags). Weigh slip #${slipNo} recorded.`,
        timestamp: nowISO,
        type: 'weighing',
        isRead: false,
        actionUrl: '/farmer/status'
      };
      setNotifications(prev => [notif, ...prev]);
    }
    setLastSyncTime(new Date());
  };

  const completeProcurement = (procurementId: string, remarks?: string) => {
    const target = procurements.find(p => p.id === procurementId);
    if (!target) return;

    const cropInfo = CROPS_CATALOGUE.find(c => c.name === target.cropType) || CROPS_CATALOGUE[0];
    const netWeight = target.weighing?.netWeight || target.declaredQuantity;
    const mspAmount = netWeight * cropInfo.mspRatePerQuintal;

    const nowISO = new Date().toISOString();
    const nowFormatted = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
    const dbtBatchNo = `DBT-OD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const bankRefNo = `PFMS${Date.now().toString().slice(-8)}`;
    const utrNumber = `SBIN${Math.floor(10000000000 + Math.random() * 90000000000)}`;

    const farmer = farmers.find(f => f.id === target.farmerId) || activeFarmer;

    const payment: PaymentRecord = {
      id: generateId('pay'),
      procurementAmount: mspAmount,
      mspRate: cropInfo.mspRatePerQuintal,
      qualityDeductionBonus: 0,
      netPayableAmount: mspAmount,
      paymentStatus: 'PROCESSING',
      dbtBatchNo,
      bankRefNo,
      utrNumber,
      initiatedAt: nowISO,
      accountNumberMasked: farmer.bankAccountNumber,
      bankName: farmer.bankName
    };

    setProcurements(prev =>
      prev.map(p => {
        if (p.id === procurementId) {
          return {
            ...p,
            stage: 'PROCUREMENT_COMPLETE',
            queueStatus: 'Completed',
            queuePosition: 0,
            estimatedWaitMinutes: 0,
            remarks: remarks || p.remarks,
            payment,
            timeline: [
              ...p.timeline,
              {
                stage: 'PROCUREMENT_COMPLETE',
                timestamp: nowFormatted,
                title: 'Procurement Complete & J-Form Issued',
                description: `Official Certificate of Procurement generated for ${netWeight} Qtl ${target.cropType}. Total: ₹${mspAmount.toLocaleString('en-IN')}.`
              },
              {
                stage: 'PAYMENT_INITIATED',
                timestamp: nowFormatted,
                title: 'DBT Payment Disbursal Initiated',
                description: `Pushed to PFMS DBT Batch #${dbtBatchNo} for bank account ${farmer.bankAccountNumber} (${farmer.bankName}).`
              }
            ]
          };
        }
        return p;
      })
    );

    setCentres(prev =>
      prev.map(c => {
        if (c.id === target.centreId) {
          return {
            ...c,
            queueLength: Math.max(0, c.queueLength - 1)
          };
        }
        return c;
      })
    );

    const farmerNotif: NotificationItem = {
      id: generateId('notif'),
      userId: target.farmerId,
      role: 'FARMER',
      title: `Procurement Completed & Payment Processing (₹${mspAmount.toLocaleString('en-IN')})`,
      message: `Your ${netWeight} Qtl ${target.cropType} has been successfully procured. Payment of ₹${mspAmount.toLocaleString('en-IN')} has been initiated to your ${farmer.bankName} account.`,
      timestamp: nowISO,
      type: 'payment',
      isRead: false,
      actionUrl: '/farmer/payments'
    };

    const adminNotif: NotificationItem = {
      id: generateId('notif'),
      userId: 'admin',
      role: 'ADMIN',
      title: `New Procurement Settled: ₹${mspAmount.toLocaleString('en-IN')}`,
      message: `${target.centreName} completed procurement of ${netWeight} Qtl from ${target.farmerName}.`,
      timestamp: nowISO,
      type: 'system',
      isRead: false,
      actionUrl: '/admin/procurement'
    };

    setNotifications(prev => [farmerNotif, adminNotif, ...prev]);
    setLastSyncTime(new Date());
  };

  const updateCentreCapacity = (centreId: string, newDailyCapacity: number, newStatus?: CentreStatus) => {
    setCentres(prev =>
      prev.map(c => {
        if (c.id === centreId) {
          const status = newStatus || (c.currentLoad >= newDailyCapacity ? 'FULL' : c.currentLoad >= newDailyCapacity * 0.85 ? 'NEAR CAPACITY' : 'NORMAL');
          return { ...c, dailyCapacity: newDailyCapacity, status };
        }
        return c;
      })
    );
    setLastSyncTime(new Date());
  };

  const updateCentre = (centreId: string, data: Partial<ProcurementCentre>) => {
    setCentres(prev =>
      prev.map(c => {
        if (c.id === centreId) {
          return { ...c, ...data };
        }
        return c;
      })
    );
    setLastSyncTime(new Date());
    // Persist to backend
    api.updateCentre(centreId, data).catch(err => {
      console.warn('Failed to persist centre update to backend:', err);
    });
  };

  const addCentre = (newCentreData: Omit<ProcurementCentre, 'id' | 'queueLength' | 'currentLoad'>) => {
    const tempId = generateId('c');
    const newCentre: ProcurementCentre = {
      ...newCentreData,
      id: tempId,
      queueLength: 0,
      currentLoad: 0
    };
    setCentres(prev => [...prev, newCentre]);
    setLastSyncTime(new Date());
    // Persist to backend — replace temp ID with server-assigned ID on success
    api.addCentre(newCentreData as Partial<ProcurementCentre>).then(serverCentre => {
      setCentres(prev =>
        prev.map(c => c.id === tempId ? { ...serverCentre } : c)
      );
    }).catch(err => {
      console.warn('Failed to persist new centre to backend:', err);
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const loginFarmer = ({ phone, name, email }: { phone: string; name?: string; email?: string }): Farmer => {
    let farmer = farmers.find(f => f.phone === phone || f.phone.replace(/\D/g, '') === phone.replace(/\D/g, ''));
    if (!farmer) {
      const cleanPhone = phone.trim();
      const generatedId = `FRM-OD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      farmer = {
        id: generatedId,
        name: name?.trim() || `Farmer ${cleanPhone.slice(-4) || 'User'}`,
        phone: cleanPhone,
        aadhaarNumber: `XXXX-XXXX-${cleanPhone.slice(-4) || '9281'}`,
        pmKisanId: `PMK-${Math.floor(10000000 + Math.random() * 90000000)}`,
        district: 'Bargarh',
        block: 'Bhatli',
        village: 'Kansar',
        pincode: '768038',
        landAreaAcres: 4.5,
        khatianNumber: `KH-${Math.floor(100 + Math.random() * 900)}`,
        plotNumber: `PL-${Math.floor(100 + Math.random() * 900)}`,
        bankName: 'State Bank of India',
        bankAccountNumber: `XXXXXXXX${Math.floor(1000 + Math.random() * 9000)}`,
        ifscCode: 'SBIN0001234',
        preferredLanguage: 'en'
      };
      setFarmers(prev => [farmer!, ...prev]);
    }

    const session: UserSession = {
      id: `usr-${farmer.id}`,
      name: farmer.name,
      phone: farmer.phone,
      email: email || `${farmer.name.toLowerCase().replace(/\s+/g, '.')}@farmer.in`,
      role: 'FARMER',
      farmerId: farmer.id,
      district: farmer.district,
      isLoggedIn: true
    };

    setCurrentUser(session);
    setActiveFarmerIdState(farmer.id);
    setRoleState('FARMER');
    setLastSyncTime(new Date());
    return farmer;
  };

  const registerFarmer = (data: Partial<Farmer> & { name: string; phone: string }): Farmer => {
    const cleanPhone = data.phone.trim();
    const generatedId = `FRM-OD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newFarmer: Farmer = {
      id: generatedId,
      name: data.name.trim(),
      phone: cleanPhone,
      aadhaarNumber: data.aadhaarNumber || `XXXX-XXXX-${cleanPhone.slice(-4) || '9281'}`,
      pmKisanId: data.pmKisanId || `PMK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      district: data.district || 'Bargarh',
      block: data.block || 'Bhatli',
      village: data.village || 'Kansar',
      pincode: data.pincode || '768038',
      landAreaAcres: data.landAreaAcres || 3.5,
      khatianNumber: data.khatianNumber || `KH-${Math.floor(100 + Math.random() * 900)}`,
      plotNumber: data.plotNumber || `PL-${Math.floor(100 + Math.random() * 900)}`,
      bankName: data.bankName || 'State Bank of India',
      bankAccountNumber: data.bankAccountNumber || `XXXXXXXX${Math.floor(1000 + Math.random() * 9000)}`,
      ifscCode: data.ifscCode || 'SBIN0001234',
      preferredLanguage: data.preferredLanguage || 'en'
    };

    setFarmers(prev => [newFarmer, ...prev]);

    const session: UserSession = {
      id: `usr-${newFarmer.id}`,
      name: newFarmer.name,
      phone: newFarmer.phone,
      email: `${newFarmer.name.toLowerCase().replace(/\s+/g, '.')}@farmer.in`,
      role: 'FARMER',
      farmerId: newFarmer.id,
      district: newFarmer.district,
      isLoggedIn: true
    };

    setCurrentUser(session);
    setActiveFarmerIdState(newFarmer.id);
    setRoleState('FARMER');
    setLastSyncTime(new Date());
    return newFarmer;
  };

  const loginOperator = ({ emailOrId, centreId, name }: { emailOrId: string; centreId: string; name?: string }) => {
    const centre = centres.find(c => c.id === centreId) || centres[0];
    const session: UserSession = {
      id: `usr-op-${centre.id}`,
      name: name || centre.officerInCharge || 'Mandi Superintendent',
      phone: centre.contactNumber || '9437012345',
      email: emailOrId.includes('@') ? emailOrId : `${emailOrId}@mandi.gov.in`,
      role: 'OPERATOR',
      centreId: centre.id,
      district: centre.district,
      isLoggedIn: true
    };

    setCurrentUser(session);
    setActiveCentreIdState(centre.id);
    setRoleState('OPERATOR');
    setLastSyncTime(new Date());
  };

  const loginAdmin = ({ emailOrId, name }: { emailOrId: string; name?: string }) => {
    const session: UserSession = {
      id: 'usr-admin-odisha',
      name: name || 'Director of Agricultural Marketing & Civil Supplies',
      phone: '9437000001',
      email: emailOrId.includes('@') ? emailOrId : `${emailOrId}@krishisetu.gov.in`,
      role: 'ADMIN',
      district: 'Statewide',
      isLoggedIn: true
    };

    setCurrentUser(session);
    setRoleState('ADMIN');
    setLastSyncTime(new Date());
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    setLastSyncTime(new Date());
  };

  const gateCheckin = async (tokenOrQr: string): Promise<boolean> => {
    try {
      const updated = await api.gateCheckin(tokenOrQr);
      if (updated) {
        setProcurements(prev => prev.map(p => p.id === updated.id ? updated : p));
        setLastSyncTime(new Date());
        return true;
      }
    } catch {
      // Local fallback
    }

    let clean = tokenOrQr.trim();
    if (clean.startsWith('KRISHISETU:')) {
      clean = clean.split(':')[1] || clean;
    }
    let found = false;
    setProcurements(prev => prev.map(p => {
      if (p.tokenNumber.toUpperCase() === clean.toUpperCase() || p.id === clean) {
        found = true;
        return {
          ...p,
          stage: 'FARMER_ARRIVED',
          timeline: [
            ...p.timeline,
            {
              stage: 'FARMER_ARRIVED',
              timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
              title: 'Mandi Gate Inward Verified',
              description: 'Arrival validated by Mandi Gate Scanner.'
            }
          ]
        };
      }
      return p;
    }));
    setLastSyncTime(new Date());
    return found;
  };

  const releaseDbtPayment = async (procurementId: string, utrNumber?: string): Promise<boolean> => {
    try {
      const res = await api.releaseDbt(procurementId, utrNumber);
      if (res?.procurement) {
        setProcurements(prev => prev.map(p => p.id === res.procurement.id ? res.procurement : p));
        setLastSyncTime(new Date());
        return true;
      }
    } catch {
      // Local fallback
    }

    setProcurements(prev => prev.map(p => {
      if (p.id === procurementId && p.payment) {
        const utr = utrNumber || `SBIN${Date.now()}`;
        return {
          ...p,
          stage: 'PAYMENT_COMPLETED',
          payment: {
            ...p.payment,
            paymentStatus: 'CREDITED',
            utrNumber: utr,
            creditedAt: new Date().toISOString()
          },
          timeline: [
            ...p.timeline,
            {
              stage: 'PAYMENT_COMPLETED',
              timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
              title: 'DBT Payment Credited',
              description: `Directly credited via PFMS. UTR: ${utr}`
            }
          ]
        };
      }
      return p;
    }));
    setLastSyncTime(new Date());
    return true;
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.FARMERS);
    localStorage.removeItem(STORAGE_KEYS.CENTRES);
    localStorage.removeItem(STORAGE_KEYS.PROCUREMENTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    setFarmers(INITIAL_FARMERS);
    setCentres(INITIAL_CENTRES);
    setProcurements(INITIAL_PROCUREMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveFarmerIdState('FRM-OD-2026-8812');
    setActiveCentreIdState('c-1');
    setRoleState('FARMER');
    setCurrentUser({
      id: 'usr-farmer-1042',
      name: 'Ramesh Kumar',
      phone: '9876543210',
      email: 'ramesh.farmer@agri.in',
      role: 'FARMER',
      farmerId: 'FRM-OD-2026-8812',
      district: 'Bargarh',
      isLoggedIn: true
    });
    setLastSyncTime(new Date());
  };

  return (
    <AppStateContext.Provider
      value={{
        role,
        setRole,
        activeFarmer,
        setActiveFarmerId,
        activeCentreId,
        setActiveCentreId,
        currentUser,
        isAuthenticated,
        loginFarmer,
        registerFarmer,
        loginOperator,
        loginAdmin,
        logout,
        farmers,
        centres,
        procurements,
        notifications,
        connectionStatus,
        setConnectionStatus,
        lastSyncTime,
        syncNow,
        registerAndBookSlot,
        updateSlotBooking,
        cancelSlot,
        callFarmer,
        gateCheckin,
        updateQueueStatus,
        releaseDbtPayment,
        submitQualityCheck,
        submitWeighing,
        completeProcurement,
        updateCentreCapacity,
        updateCentre,
        addCentre,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetDemoData
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
