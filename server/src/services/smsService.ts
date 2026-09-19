import { SmsRecord } from '../types.js';
import { db } from '../db/database.js';
import { eventService } from './eventService.js';

class SmsService {
  private senderId = 'VM-KISANQ';

  /**
   * Send a simulated government SMS
   */
  public async sendSms(params: {
    phone: string;
    templateId: string;
    message: string;
    meta?: Record<string, unknown>;
  }): Promise<SmsRecord> {
    const record: SmsRecord = {
      id: `SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipientPhone: params.phone,
      senderId: this.senderId,
      templateId: params.templateId,
      message: params.message,
      status: 'DELIVERED',
      sentAt: new Date().toISOString(),
      meta: params.meta
    };

    db.smsLogs.insert(record);

    // Broadcast to SSE clients so farmer's phone simulator pops up
    eventService.broadcast('SMS_DELIVERED', record, {
      farmerId: params.meta?.farmerId as string | undefined,
      procurementId: params.meta?.procurementId as string | undefined
    });

    return record;
  }

  public notifySlotBooking(farmerName: string, phone: string, tokenNumber: string, centreName: string, date: string, time: string, procurementId: string) {
    return this.sendSms({
      phone,
      templateId: 'DLT_SLOT_BOOKED',
      message: `Dear ${farmerName}, your mandi procurement slot is CONFIRMED for ${date} at ${time}. Token: ${tokenNumber} at ${centreName}. Please arrive 15 mins prior. - Food & Public Distribution Dept`,
      meta: { tokenNumber, procurementId }
    });
  }

  public notifyTokenCalled(farmerName: string, phone: string, tokenNumber: string, bayOrGate: string, procurementId: string) {
    return this.sendSms({
      phone,
      templateId: 'DLT_TOKEN_CALLED',
      message: `URGENT: Token ${tokenNumber} (${farmerName}) has been CALLED to ${bayOrGate}. Please proceed immediately with your tractor/vehicle. - KISAN-Q Mandi Ops`,
      meta: { tokenNumber, procurementId }
    });
  }

  public notifyQualityCheck(farmerName: string, phone: string, tokenNumber: string, grade: string, moisture: number, procurementId: string) {
    return this.sendSms({
      phone,
      templateId: 'DLT_QUALITY_RESULT',
      message: `Token ${tokenNumber}: Quality inspection done. Grade: ${grade}, Moisture: ${moisture}%. Status: APPROVED for weighment. - KISAN-Q Mandi Ops`,
      meta: { tokenNumber, procurementId }
    });
  }

  public notifyWeighing(farmerName: string, phone: string, tokenNumber: string, netWeightQuintals: number, slipNo: string, procurementId: string) {
    return this.sendSms({
      phone,
      templateId: 'DLT_WEIGH_SLIP',
      message: `Token ${tokenNumber}: Digital weighment completed. Net Weight: ${netWeightQuintals} Quintals. Weighment Slip No: ${slipNo}. Payment file generated. - KISAN-Q`,
      meta: { tokenNumber, procurementId }
    });
  }

  public notifyPaymentCredited(farmerName: string, phone: string, tokenNumber: string, amount: number, utrNumber: string, bankAccount: string, procurementId: string) {
    return this.sendSms({
      phone,
      templateId: 'DLT_DBT_CREDIT',
      message: `Govt DBT Alert: Rs. ${amount.toLocaleString('en-IN')} has been CREDITED via PFMS to account ${bankAccount} for Token ${tokenNumber}. UTR: ${utrNumber}. - Ministry of Consumer Affairs, Food & PD`,
      meta: { tokenNumber, procurementId }
    });
  }
}

export const smsService = new SmsService();
