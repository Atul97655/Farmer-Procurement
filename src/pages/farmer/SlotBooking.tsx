import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  Building2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Wheat,
  QrCode
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { QRModal } from '../../components/common/QRModal';

interface TimeSlotOption {
  time: string;
  availableCount: number;
  isFull: boolean;
}

export const SlotBooking: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeFarmer, centres, registerAndBookSlot } = useAppState();
  const { t } = useLanguage();

  // Registration data passed from step 4 or default
  const registrationData = location.state?.registrationData || {
    cropType: 'Paddy (Common)',
    variety: 'Swarna (MTU 7029)',
    quantity: 45,
    harvestDate: '2026-09-04',
    transportMode: 'Tractor Trolley',
    selectedCentreId: centres[0]?.id || 'c-1'
  };

  const selectedCentre = centres.find(c => c.id === registrationData.selectedCentreId) || centres[0];

  // Dates: Next 5 days
  const today = new Date();
  const availableDates = [0, 1, 2, 3, 4].map(offset => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      formattedDate: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    };
  });

  const [selectedDate, setSelectedDate] = useState(availableDates[0].dateStr);

  // Time slots per day
  const timeSlots: TimeSlotOption[] = [
    { time: '08:30 - 09:30 AM', availableCount: 5, isFull: false },
    { time: '09:30 - 10:30 AM', availableCount: 3, isFull: false },
    { time: '10:30 - 11:30 AM', availableCount: 0, isFull: true },
    { time: '11:30 - 12:30 PM', availableCount: 8, isFull: false },
    { time: '01:30 - 02:30 PM', availableCount: 6, isFull: false },
    { time: '02:30 - 03:30 PM', availableCount: 2, isFull: false },
    { time: '03:30 - 04:30 PM', availableCount: 0, isFull: true },
    { time: '04:30 - 05:30 PM', availableCount: 4, isFull: false }
  ];

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('08:30 - 09:30 AM');
  const [createdRecord, setCreatedRecord] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmBooking = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const record = registerAndBookSlot({
        farmerId: activeFarmer.id,
        centreId: selectedCentre.id,
        cropType: registrationData.cropType,
        variety: registrationData.variety,
        declaredQuantity: registrationData.quantity,
        harvestDate: registrationData.harvestDate,
        slotDate: selectedDate,
        slotTime: selectedTimeSlot,
        transportMode: registrationData.transportMode
      });

      setCreatedRecord(record);
      setIsSubmitting(false);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Procurement Slot Booking & Token Generation
        </h1>
        <p className="text-sm text-slate-500">
          Select a verified time window at {selectedCentre.name} to guarantee hassle-free yard entry.
        </p>
      </div>

      {!createdRecord ? (
        <div className="space-y-6">
          
          {/* Summary of Crop Registration */}
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
                <Wheat className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-emerald-800">Booking Summary</span>
                <strong className="text-base text-emerald-950 block">
                  {registrationData.cropType} ({registrationData.variety}) — {registrationData.quantity} Qtl
                </strong>
                <span className="text-xs text-emerald-700">
                  Farmer: <strong>{activeFarmer.name}</strong> ({activeFarmer.id})
                </span>
              </div>
            </div>

            <div className="bg-white/80 rounded-xl p-2.5 border border-emerald-300 text-xs">
              <div className="flex items-center gap-1 text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                <strong>{selectedCentre.name}</strong>
              </div>
              <span className="text-slate-500 text-[11px] block mt-0.5">
                Remaining Capacity: <strong className="text-emerald-800">{selectedCentre.dailyCapacity - selectedCentre.currentLoad} Qtl</strong>
              </span>
            </div>
          </div>

          {/* 1. Date Selector */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>1. Select Scheduled Date:</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {availableDates.map((item) => {
                const isSelected = item.dateStr === selectedDate;
                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-[11px] uppercase font-semibold block opacity-80">{item.dayName}</span>
                    <strong className="text-base font-black block mt-0.5">{item.formattedDate}</strong>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Time Window Selector */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>2. Select Time Window:</span>
              </label>
              <span className="text-xs text-slate-500">
                Capacity-enforced slots prevent yard overcrowding
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {timeSlots.map((slot) => {
                const isSelected = selectedTimeSlot === slot.time;
                const isFull = slot.isFull;

                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={isFull}
                    onClick={() => !isFull && setSelectedTimeSlot(slot.time)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isFull
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                        : isSelected
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs font-bold cursor-pointer'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 cursor-pointer'
                    }`}
                  >
                    <div className="text-sm font-bold">{slot.time}</div>
                    <div className="mt-1 flex items-center justify-between">
                      {isFull ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                          FULL
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-800">
                          {slot.availableCount} slots left
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confirmation Box & Guarantee */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Long Queue Guarantee</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Book for {formatDate(selectedDate)} ({selectedTimeSlot})
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Token with digital QR pass will be issued immediately upon confirmation.
              </p>
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer text-sm"
            >
              {isSubmitting ? (
                <span>Generating Token...</span>
              ) : (
                <>
                  <span>Confirm & Issue Token</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      ) : (
        /* Booking Success Card */
        <div className="bg-white rounded-3xl p-8 border-2 border-emerald-500 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Booking Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Slot Allocated Successfully!
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              Your appointment has been registered at {createdRecord.centreName}.
            </p>
          </div>

          {/* Token Display Banner */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 max-w-sm mx-auto">
            <span className="text-xs uppercase font-bold text-amber-800 tracking-wider">
              Your Digital Token Number
            </span>
            <div className="text-4xl font-black text-amber-950 font-mono tracking-wider my-1">
              {createdRecord.tokenNumber}
            </div>
            <span className="text-xs text-emerald-800 font-semibold">
              Slot: {formatDate(createdRecord.slotDate)} ({createdRecord.slotTime})
            </span>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/farmer/my-slot')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors flex items-center gap-2 text-sm cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>View & Print Gate Pass</span>
            </button>
            <button
              onClick={() => navigate('/farmer/queue')}
              className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm cursor-pointer"
            >
              <span>Track Live Queue Position</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
