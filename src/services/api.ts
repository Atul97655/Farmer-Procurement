import {
  Farmer,
  ProcurementCentre,
  ProcurementRecord,
  NotificationItem,
  QualityGrade,
  QualityResult,
  CentreStatus,
  QueueStatus,
  CropType
} from '../types';

const API_BASE = '/api';

export interface SmsLogItem {
  id: string;
  recipientPhone: string;
  senderId: string;
  templateId: string;
  message: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED';
  sentAt: string;
  meta?: Record<string, unknown>;
}

export interface AiGrainAnalysisResult {
  success: boolean;
  cropType: string;
  aiModel: string;
  metrics: {
    moisturePercentage: number;
    foreignMatterPercentage: number;
    damagedGrainPercentage: number;
    immatureGrainPercentage: number;
  };
  recommendation: {
    grade: QualityGrade;
    result: QualityResult;
    confidenceScore: string;
    advice: string;
    isWithinFciNorms: boolean;
  };
}

class ApiService {
  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.error || errorBody.message || `API Error: ${res.statusText}`);
    }

    return res.json();
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }

  // Centres
  async getCentres(): Promise<ProcurementCentre[]> {
    const data = await this.request<{ success: boolean; centres: ProcurementCentre[] }>('/centres');
    return data.centres;
  }

  async updateCentreCapacity(centreId: string, newDailyCapacity: number, newStatus?: CentreStatus): Promise<ProcurementCentre> {
    const data = await this.request<{ success: boolean; centre: ProcurementCentre }>(`/centres/${centreId}/capacity`, {
      method: 'PATCH',
      body: JSON.stringify({ newDailyCapacity, newStatus })
    });
    return data.centre;
  }

  // Farmers
  async getFarmers(): Promise<Farmer[]> {
    const data = await this.request<{ success: boolean; farmers: Farmer[] }>('/farmers');
    return data.farmers;
  }

  async registerFarmer(farmerData: Partial<Farmer> & { name: string; phone: string }): Promise<Farmer> {
    const data = await this.request<{ success: boolean; farmer: Farmer }>('/farmers', {
      method: 'POST',
      body: JSON.stringify(farmerData)
    });
    return data.farmer;
  }

  // Procurements
  async getProcurements(filters?: { centreId?: string; farmerId?: string }): Promise<ProcurementRecord[]> {
    const params = new URLSearchParams();
    if (filters?.centreId) params.append('centreId', filters.centreId);
    if (filters?.farmerId) params.append('farmerId', filters.farmerId);

    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await this.request<{ success: boolean; procurements: ProcurementRecord[] }>(`/procurements${query}`);
    return data.procurements;
  }

  async bookSlot(data: {
    farmerId: string;
    centreId: string;
    cropType: CropType;
    variety: string;
    declaredQuantity: number;
    harvestDate: string;
    slotDate: string;
    slotTime: string;
    transportMode: string;
  }): Promise<ProcurementRecord> {
    const res = await this.request<{ success: boolean; procurement: ProcurementRecord }>('/procurements/book', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.procurement;
  }

  async submitQualityCheck(procurementId: string, data: {
    moisturePercentage: number;
    foreignMatterPercentage: number;
    damagedGrainPercentage: number;
    immatureGrainPercentage: number;
    grade: QualityGrade;
    result: QualityResult;
    remarks: string;
    inspectorName: string;
  }): Promise<ProcurementRecord> {
    const res = await this.request<{ success: boolean; procurement: ProcurementRecord }>(`/procurements/${procurementId}/quality-check`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.procurement;
  }

  async submitWeighing(procurementId: string, data: {
    grossWeight: number;
    tareWeight: number;
    bagCount: number;
    vehicleNumber: string;
    operatorName: string;
  }): Promise<ProcurementRecord> {
    const res = await this.request<{ success: boolean; procurement: ProcurementRecord }>(`/procurements/${procurementId}/weighing`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.procurement;
  }

  async updateSlotBooking(procurementId: string, data: Partial<{
    cropType: CropType;
    variety: string;
    declaredQuantity: number;
    centreId: string;
    slotDate: string;
    slotTime: string;
    transportMode: string;
    harvestDate: string;
  }>): Promise<ProcurementRecord> {
    const res = await this.request<{ success: boolean; procurement: ProcurementRecord }>(`/procurements/${procurementId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.procurement;
  }

  async cancelSlot(procurementId: string, reason?: string): Promise<ProcurementRecord> {
    const res = await this.request<{ success: boolean; procurement: ProcurementRecord }>(`/procurements/${procurementId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    return res.procurement;
  }

  // Queue Operations
  async callNextToken(params: { centreId: string; procurementId?: string; bayNumber?: string }): Promise<ProcurementRecord> {
    const res = await this.request<{ success: boolean; calledToken: ProcurementRecord }>('/queue/call-next', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    return res.calledToken;
  }

  async gateCheckin(tokenOrQrData: string, centreId?: string): Promise<ProcurementRecord> {
    const res = await this.request<{ success: boolean; procurement: ProcurementRecord }>('/queue/gate-checkin', {
      method: 'POST',
      body: JSON.stringify({ tokenOrQrData, centreId })
    });
    return res.procurement;
  }

  async updateQueueStatus(procurementId: string, status: QueueStatus): Promise<ProcurementRecord> {
    const res = await this.request<{ success: boolean; procurement: ProcurementRecord }>('/queue/update-status', {
      method: 'POST',
      body: JSON.stringify({ procurementId, status })
    });
    return res.procurement;
  }

  // Payments / DBT
  async releaseDbt(procurementId: string, utrNumber?: string): Promise<{ procurement: ProcurementRecord; utrNumber: string }> {
    return this.request<{ success: boolean; procurement: ProcurementRecord; utrNumber: string }>('/payments/release-dbt', {
      method: 'POST',
      body: JSON.stringify({ procurementId, utrNumber })
    });
  }

  // Notifications
  async getNotifications(params?: { userId?: string; role?: string }): Promise<NotificationItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.append('userId', params.userId);
    if (params?.role) searchParams.append('role', params.role);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const data = await this.request<{ success: boolean; notifications: NotificationItem[] }>(`/notifications${query}`);
    return data.notifications;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsAsRead(userId?: string): Promise<void> {
    await this.request('/notifications/read-all', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  // SMS Simulator Logs
  async getSmsLogs(phone?: string): Promise<SmsLogItem[]> {
    const query = phone ? `?phone=${encodeURIComponent(phone)}` : '';
    const res = await this.request<{ success: boolean; smsLogs: SmsLogItem[] }>(`/sms${query}`);
    return res.smsLogs;
  }

  // AI Grain Quality Assistant
  async getAiGrainAnalysis(params: { cropType: string; overrideMoisture?: number }): Promise<AiGrainAnalysisResult> {
    return this.request<AiGrainAnalysisResult>('/ai/grain-quality-assist', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // Real-Time Server-Sent Events (SSE) Stream
  subscribeEvents(onEvent: (event: { type: string; payload: unknown; timestamp: string }) => void): () => void {
    const sse = new EventSource('/api/events');

    sse.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        onEvent(data);
      } catch (e) {
        console.warn('Failed to parse SSE event payload:', e);
      }
    };

    sse.onerror = () => {
      // EventSource auto-reconnects
    };

    return () => {
      sse.close();
    };
  }
}

export const api = new ApiService();
