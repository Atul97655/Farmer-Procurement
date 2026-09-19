import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Wheat,
  QrCode,
  Printer,
  Trash2,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  Truck,
  Edit3,
  Smartphone
} from 'lucide-react';
import { QRModal } from '../../components/common/QRModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { GracePeriodCountdown } from '../../components/farmer/GracePeriodCountdown';
import { EditBookingModal } from '../../components/farmer/EditBookingModal';

export const MySlotPage: React.FC = () => {
  const { activeFarmer, procurements, cancelSlot, updateSlotBooking } = useAppState();
  const { t } = useLanguage();
  const [selectedQR, setSelectedQR] = useState<any | null>(null);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);

  const farmerRecords = procurements.filter(p => p.farmerId === activeFarmer.id);
  const activeRecord = farmerRecords.find(p => p.queueStatus !== 'Cancelled' && p.queueStatus !== 'Completed') || farmerRecords[0];

  const handleCancel = async (id: string, token: string) => {
    if (window.confirm(`Are you sure you want to cancel slot for Token #${token}?`)) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      await cancelSlot(id, 'Cancelled by farmer from My Bookings.');
    }
  };

  const handleSaveEdit = async (updatedData: any) => {
    if (!editingRecord) return;
    await updateSlotBooking(editingRecord.id, updatedData);
    setEditingRecord(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Booked Slots & Digital Passes
          </h1>
          <p className="text-sm text-slate-500">
            View your active appointment, download QR gate pass, or cancel scheduled slots.
          </p>
        </div>

        <Link
          to="/farmer/register-crop"
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book Another Slot</span>
        </Link>
      </div>

      {farmerRecords.length > 0 ? (
        <div className="space-y-6">
          {farmerRecords.map((record) => {
            const isCancelled = record.queueStatus === 'Cancelled';
            const isCompleted = record.queueStatus === 'Completed';

            return (
              <div
                key={record.id}
                className={`bg-white rounded-3xl border p-6 shadow-xs transition-all ${
                  isCancelled
                    ? 'border-slate-200 opacity-60'
                    : 'border-emerald-500/40 shadow-sm'
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-100 text-amber-900 font-mono font-black text-lg">
                      {record.tokenNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-base text-slate-900">{record.cropType}</strong>
                        <span className="text-xs text-slate-500 font-medium">({record.variety})</span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        Declared: <strong className="text-emerald-800">{record.declaredQuantity} Quintals</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={record.queueStatus} size="md" />
                  </div>
                </div>

                {/* 1-Minute Grace Window Banner */}
                {!isCancelled && record.stage === 'SLOT_ASSIGNED' && (
                  <div className="mb-4">
                    <GracePeriodCountdown
                      bookingTimestamp={record.bookingTimestamp}
                      onEditClick={() => setEditingRecord(record)}
                      onCancelClick={() => handleCancel(record.id, record.tokenNumber)}
                      isCancelled={isCancelled}
                      compact={true}
                    />
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Procurement Mandi
                    </span>
                    <strong className="text-xs text-slate-800 block mt-0.5">{record.centreName}</strong>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Scheduled Date
                    </span>
                    <strong className="text-xs text-slate-800 block mt-0.5">{formatDate(record.slotDate)}</strong>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Scheduled Window
                    </span>
                    <strong className="text-xs text-amber-800 font-bold block mt-0.5">{record.slotTime}</strong>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vehicle: {record.transportMode}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isCancelled && (
                      <>
                        <button
                          onClick={() => setSelectedQR(record)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>View Digital QR Pass</span>
                        </button>

                        <button
                          onClick={() => setSelectedQR(record)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Slip</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => window.dispatchEvent(new CustomEvent('OPEN_SMS_DRAWER'))}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="View official SMS delivered to registered phone"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                          <span>SMS Alert</span>
                        </button>
                      </>
                    )}

                    {!isCancelled && !isCompleted && record.stage === 'SLOT_ASSIGNED' && (
                      <button
                        onClick={() => handleCancel(record.id, record.tokenNumber)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel Slot</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs">
          <p className="text-slate-500 text-sm mb-4">No slots have been booked yet for {activeFarmer.name}.</p>
          <Link
            to="/farmer/register-crop"
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl inline-block text-sm"
          >
            Register Harvest & Book Slot Now
          </Link>
        </div>
      )}

      {/* QR Modal */}
      {selectedQR && (
        <QRModal
          procurement={selectedQR}
          isOpen={true}
          onClose={() => setSelectedQR(null)}
        />
      )}

      {/* Edit Booking Modal */}
      {editingRecord && (
        <EditBookingModal
          procurement={editingRecord}
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={handleSaveEdit}
          secondsLeft={Math.max(0, Math.ceil((60 * 1000 - (Date.now() - new Date(editingRecord.bookingTimestamp).getTime())) / 1000))}
        />
      )}
    </div>
  );
};
