import React, { useState } from 'react';
import {
  X,
  Wheat,
  Building2,
  Calendar,
  Clock,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Save,
  RotateCcw
} from 'lucide-react';
import { ProcurementRecord, CropType } from '../../types';
import { useAppState } from '../../context/AppStateContext';
import { CROPS_CATALOGUE } from '../../data/mockData';
import { formatDate } from '../../utils/formatters';
import {
  STANDARD_MANDI_SLOTS,
  getLocalDateString,
  isSlotPassed,
  getFirstAvailableSlot
} from '../../utils/timeSlotUtils';

interface EditBookingModalProps {
  procurement: ProcurementRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: {
    cropType: CropType;
    variety: string;
    declaredQuantity: number;
    centreId: string;
    slotDate: string;
    slotTime: string;
    transportMode: string;
  }) => Promise<void>;
  secondsLeft: number;
}

export const EditBookingModal: React.FC<EditBookingModalProps> = ({
  procurement,
  isOpen,
  onClose,
  onSave,
  secondsLeft
}) => {
  const { centres } = useAppState();

  // Form State initialized with current booking data
  const [cropType, setCropType] = useState<CropType>(procurement.cropType);
  const [variety, setVariety] = useState<string>(procurement.variety);
  const [quantity, setQuantity] = useState<number>(procurement.declaredQuantity);
  const [centreId, setCentreId] = useState<string>(procurement.centreId);
  const [slotDate, setSlotDate] = useState<string>(procurement.slotDate);
  const [slotTime, setSlotTime] = useState<string>(procurement.slotTime);
  const [transportMode, setTransportMode] = useState<string>(procurement.transportMode || 'Tractor Trolley');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  if (!isOpen) return null;

  // Next 5 days dates
  const today = new Date();
  const availableDates = [0, 1, 2, 3, 4].map(offset => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return {
      dateStr: getLocalDateString(d),
      dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      formattedDate: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    };
  });

  // Time slots per day
  const timeSlots = STANDARD_MANDI_SLOTS.map(s => s.time);

  const selectedCropInfo = CROPS_CATALOGUE.find(c => c.name === cropType) || CROPS_CATALOGUE[0];
  const selectedCentre = centres.find(c => c.id === centreId) || centres[0];
  const isExpired = secondsLeft <= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (isExpired) {
      setValidationError('The 1-minute window has expired. Booking details are locked.');
      return;
    }

    if (!quantity || quantity <= 0 || quantity > 500) {
      setValidationError('Please specify a valid quantity between 1 and 500 Quintals.');
      return;
    }

    if (!variety.trim()) {
      setValidationError('Crop variety name is required.');
      return;
    }

    if (isSlotPassed(slotTime, slotDate, new Date())) {
      setValidationError('The selected time window has already concluded for this date. Please choose an upcoming time slot.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        cropType,
        variety: variety.trim(),
        declaredQuantity: Number(quantity),
        centreId,
        slotDate,
        slotTime,
        transportMode
      });
      onClose();
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to update booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with Live Countdown */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-emerald-700 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                Token #{procurement.tokenNumber}
              </span>
              <span className="text-xs font-semibold text-amber-200">1-Min Correction Window</span>
            </div>
            <h2 className="text-xl font-black mt-1">Edit Booking Information</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Countdown Timer in Header */}
            <div
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black flex items-center gap-1.5 shadow-xs ${
                isExpired
                  ? 'bg-rose-900/80 text-rose-200 border border-rose-400/40'
                  : 'bg-white text-amber-950 border border-amber-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {isExpired ? 'EXPIRED' : `00:${secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft} left`}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {isExpired && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-900 text-xs rounded-xl flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
              <div>
                <strong className="block">Modification Window Expired</strong>
                <span>The 60-second mistake correction window has closed. Booking details can no longer be edited online.</span>
              </div>
            </div>
          )}

          {/* 1. Crop Information */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Wheat className="w-4 h-4 text-emerald-700" />
              <span>1. Crop & Quantity Details</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 block mb-1 font-semibold">Crop Commodity</label>
                <select
                  disabled={isExpired || isSubmitting}
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value as CropType)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  {CROPS_CATALOGUE.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} (MSP ₹{c.mspRatePerQuintal}/Qtl)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1 font-semibold">Crop Variety</label>
                <input
                  type="text"
                  disabled={isExpired || isSubmitting}
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Swarna (MTU 7029)"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1 font-semibold">Quantity (Quintals)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    disabled={isExpired || isSubmitting}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">Qtl</span>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-amber-800">Recalculated MSP Value:</span>
                <span className="text-lg font-black text-amber-950">
                  ₹{((quantity || 0) * selectedCropInfo.mspRatePerQuintal).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-700">
                  (@ ₹{selectedCropInfo.mspRatePerQuintal}/Qtl)
                </span>
              </div>
            </div>
          </div>

          {/* 2. Mandi Procurement Centre */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>2. Procurement Mandi Yard</span>
            </label>

            <div>
              <select
                disabled={isExpired || isSubmitting}
                value={centreId}
                onChange={(e) => setCentreId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                {centres.map((c) => {
                  const remaining = Math.max(0, c.dailyCapacity - c.currentLoad);
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.district}) — Cap: {remaining} Qtl free ({c.status})
                    </option>
                  );
                })}
              </select>

              <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                <span>Selected: <strong>{selectedCentre.name}</strong></span>
                <span>·</span>
                <span>Operating: <strong>{selectedCentre.operatingHours}</strong></span>
              </div>
            </div>
          </div>

          {/* 3. Scheduled Date & Time Slot */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>3. Scheduled Date & Time Window</span>
            </label>

            <div>
              <label className="text-xs text-slate-600 block mb-1.5 font-semibold">Select Date:</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {availableDates.map((item) => {
                  const isSelected = item.dateStr === slotDate;
                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      disabled={isExpired || isSubmitting}
                      onClick={() => {
                        setSlotDate(item.dateStr);
                        if (isSlotPassed(slotTime, item.dateStr, new Date())) {
                          const nextSlot = getFirstAvailableSlot(
                            timeSlots.map(t => ({ time: t, isFull: false })),
                            item.dateStr,
                            new Date()
                          );
                          if (nextSlot) setSlotTime(nextSlot);
                        }
                      }}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-700 text-white border-emerald-700 font-bold shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="text-[10px] uppercase block opacity-80">{item.dayName}</span>
                      <strong className="text-xs block mt-0.5">{item.formattedDate}</strong>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 block mb-1.5 font-semibold">Select Time Window:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {timeSlots.map((slot) => {
                  const isPassed = isSlotPassed(slot, slotDate, new Date());
                  const isSelected = slotTime === slot && !isPassed;
                  const isDisabled = isExpired || isSubmitting || isPassed;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => !isDisabled && setSlotTime(slot)}
                      className={`p-2 rounded-xl border text-center text-xs transition-all ${
                        isPassed
                          ? 'bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed line-through opacity-60'
                          : isSelected
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-2 ring-emerald-500/20 cursor-pointer'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 cursor-pointer'
                      }`}
                    >
                      <div>{slot}</div>
                      {isPassed && (
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-200 px-1 rounded block mt-0.5 no-underline">
                          PASSED
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Transport Vehicle */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>4. Transport Vehicle Type</span>
            </label>

            <select
              disabled={isExpired || isSubmitting}
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Tractor Trolley">Tractor Trolley (Standard)</option>
              <option value="Commercial Mini Truck (Tata Ace / Pickup)">Commercial Mini Truck (Tata Ace / Pickup)</option>
              <option value="Medium Goods Vehicle (6 Wheeler)">Medium Goods Vehicle (6 Wheeler)</option>
              <option value="Bullock Cart / Local Trailer">Bullock Cart / Local Trailer</option>
            </select>
          </div>

        </form>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm cursor-pointer"
          >
            Discard
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isExpired || isSubmitting}
              onClick={handleSubmit}
              className={`font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 ${
                isExpired
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating Token Details...' : 'Save & Update Token'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
