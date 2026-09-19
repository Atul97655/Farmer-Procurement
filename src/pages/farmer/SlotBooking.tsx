import React, { useState, useEffect, useMemo } from 'react';
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
  QrCode,
  Edit3,
  XCircle,
  RotateCcw,
  Smartphone
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { QRModal } from '../../components/common/QRModal';
import { GracePeriodCountdown } from '../../components/farmer/GracePeriodCountdown';
import { EditBookingModal } from '../../components/farmer/EditBookingModal';
import { CropType } from '../../types';
import {
  STANDARD_MANDI_SLOTS,
  getLocalDateString,
  isSlotPassed,
  areAllSlotsPassed,
  calculateDynamicSlots,
  getFirstAvailableSlot
} from '../../utils/timeSlotUtils';

interface TimeSlotOption {
  time: string;
  availableCount: number;
  isFull: boolean;
  isPassed?: boolean;
}

export const SlotBooking: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeFarmer, centres, procurements, registerAndBookSlot, updateSlotBooking, cancelSlot } = useAppState();
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

  // Real-time time synchronization clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 15000); // 15s live sync
    return () => clearInterval(timer);
  }, []);

  // Dates: Next 5 days
  const availableDates = [0, 1, 2, 3, 4].map(offset => {
    const d = new Date(currentTime);
    d.setDate(currentTime.getDate() + offset);
    return {
      dateStr: getLocalDateString(d),
      dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      formattedDate: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      isToday: offset === 0
    };
  });

  const todayDateStr = availableDates[0].dateStr;
  const initialTodaySlots = calculateDynamicSlots(todayDateStr, selectedCentre, procurements);
  const todayHasSlots = !areAllSlotsPassed(initialTodaySlots, todayDateStr, currentTime);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return todayHasSlots ? availableDates[0].dateStr : availableDates[1].dateStr;
  });

  // Dynamically calculate slot capacities and FULL status based on centre, date, and live bookings
  const timeSlots = useMemo(() => {
    return calculateDynamicSlots(selectedDate, selectedCentre, procurements);
  }, [selectedDate, selectedCentre, procurements]);

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(() => {
    const initialDate = todayHasSlots ? availableDates[0].dateStr : availableDates[1].dateStr;
    const initialSlots = calculateDynamicSlots(initialDate, selectedCentre, procurements);
    return getFirstAvailableSlot(initialSlots, initialDate, currentTime) || initialSlots[0].time;
  });

  // Auto-sync selected slot if it becomes passed or full
  useEffect(() => {
    const isCurrentlyPassed = isSlotPassed(selectedTimeSlot, selectedDate, currentTime);
    const isCurrentlyFull = timeSlots.find(s => s.time === selectedTimeSlot)?.isFull;
    if (isCurrentlyPassed || isCurrentlyFull) {
      const nextAvailable = getFirstAvailableSlot(timeSlots, selectedDate, currentTime);
      if (nextAvailable) {
        setSelectedTimeSlot(nextAvailable);
      }
    }
  }, [selectedDate, currentTime, selectedTimeSlot, timeSlots]);
  const [createdRecord, setCreatedRecord] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Maintain countdown for edit modal sync
  useEffect(() => {
    if (!createdRecord?.bookingTimestamp || isCancelled) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - new Date(createdRecord.bookingTimestamp).getTime();
      const remaining = Math.max(0, Math.ceil((60 * 1000 - elapsed) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [createdRecord, isCancelled]);

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
      setIsCancelled(false);
      setSecondsRemaining(60);
      setIsSubmitting(false);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 400);
  };

  const handleCancelBooking = async () => {
    if (!createdRecord) return;
    if (window.confirm('Are you sure you want to cancel this booking? This will release your reserved slot immediately.')) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      await cancelSlot(createdRecord.id, 'Cancelled by farmer during 1-min grace period.');
      setIsCancelled(true);
      setToastMessage('Booking has been cancelled. Mandi capacity was released.');
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleSaveEdit = async (updatedData: {
    cropType: CropType;
    variety: string;
    declaredQuantity: number;
    centreId: string;
    slotDate: string;
    slotTime: string;
    transportMode: string;
  }) => {
    if (!createdRecord) return;
    const updated = await updateSlotBooking(createdRecord.id, updatedData);
    if (updated) {
      setCreatedRecord(updated);
    } else {
      const updatedCentre = centres.find(c => c.id === updatedData.centreId);
      setCreatedRecord((prev: any) => ({
        ...prev,
        ...updatedData,
        centreName: updatedCentre ? updatedCentre.name : prev.centreName
      }));
    }
    setToastMessage('Booking details updated successfully during grace window!');
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
    setTimeout(() => setToastMessage(null), 5000);
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
                const isItemToday = item.isToday;
                const isTodayClosed = isItemToday && !todayHasSlots;

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
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-[11px] uppercase font-semibold opacity-80">{item.dayName}</span>
                      {isItemToday && (
                        <span className={`text-[9px] px-1 rounded font-bold uppercase ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                          Today
                        </span>
                      )}
                    </div>
                    <strong className="text-base font-black block mt-0.5">{item.formattedDate}</strong>
                    {isTodayClosed && (
                      <span className={`text-[9px] font-bold block mt-1 uppercase ${isSelected ? 'text-amber-200' : 'text-amber-700'}`}>
                        Hours Ended
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Time Window Selector with Real-time Clock Sync */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>2. Select Time Window:</span>
              </label>

              {/* Live Time Sync Clock Indicator */}
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1 rounded-full font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span>
                  Mandi Live Clock: <strong>{currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</strong>
                </span>
              </div>
            </div>

            {areAllSlotsPassed(timeSlots, selectedDate, currentTime) && (
              <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <strong>All procurement slots for this day have concluded.</strong>
                  <span className="block mt-0.5 text-amber-800">Please choose tomorrow or an upcoming date above to reserve an open slot.</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {timeSlots.map((slot) => {
                const isPassed = isSlotPassed(slot.time, selectedDate, currentTime);
                const isSelected = selectedTimeSlot === slot.time && !isPassed;
                const isFull = slot.isFull;
                const isDisabled = isFull || isPassed;

                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setSelectedTimeSlot(slot.time)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isPassed
                        ? 'bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : isFull
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                        : isSelected
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs font-bold cursor-pointer'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 cursor-pointer'
                    }`}
                  >
                    <div className={`text-sm font-bold ${isPassed ? 'line-through opacity-70' : ''}`}>
                      {slot.time}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      {isPassed ? (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                          TIME PASSED
                        </span>
                      ) : isFull ? (
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
              disabled={isSubmitting || isSlotPassed(selectedTimeSlot, selectedDate, currentTime) || areAllSlotsPassed(timeSlots, selectedDate, currentTime)}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer text-sm"
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
      ) : isCancelled ? (
        /* Cancelled View */
        <div className="bg-white rounded-3xl p-8 border-2 border-rose-300 shadow-lg text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <XCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs uppercase font-bold text-rose-700 tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Booking Cancelled
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Slot Cancelled Successfully
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              Your booking for Token <strong>#{createdRecord.tokenNumber}</strong> has been cancelled within the 1-minute grace window, and reserved capacity has been freed at {createdRecord.centreName}.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setCreatedRecord(null);
                setIsCancelled(false);
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors flex items-center gap-2 text-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Book a New Slot</span>
            </button>

            <button
              onClick={() => navigate('/farmer/my-slot')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-6 py-3 rounded-xl transition-colors text-sm cursor-pointer"
            >
              <span>View My Bookings</span>
            </button>
          </div>
        </div>
      ) : (
        /* Booking Success Card with Grace Period */
        <div className="space-y-6">
          
          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-semibold rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* 1-Minute Grace Countdown Banner */}
          <GracePeriodCountdown
            bookingTimestamp={createdRecord.bookingTimestamp}
            onEditClick={() => setIsEditModalOpen(true)}
            onCancelClick={handleCancelBooking}
            isCancelled={isCancelled}
          />

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
              <span className="text-xs text-emerald-800 font-semibold block">
                Slot: {formatDate(createdRecord.slotDate)} ({createdRecord.slotTime})
              </span>
              <span className="text-xs text-slate-600 font-medium block mt-1">
                {createdRecord.cropType} ({createdRecord.variety}) — <strong>{createdRecord.declaredQuantity} Qtl</strong>
              </span>
            </div>

            {/* Official Government DLT SMS Delivered Banner */}
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 max-w-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                  <Smartphone className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                      Official DLT SMS Sent
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-200 text-emerald-900 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-700" /> Delivered
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900 mt-1 font-medium leading-relaxed">
                    Slot confirmation SMS addressed to <strong>{createdRecord.farmerName}</strong> has been delivered to registered mobile <strong>{createdRecord.farmerPhone}</strong>.
                  </p>
                  <p className="text-[10px] text-emerald-700 font-mono mt-0.5">
                    Sender: VM-KISANQ • Template: DLT_SLOT_BOOKED
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('OPEN_SMS_DRAWER'))}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer self-stretch sm:self-center justify-center hover:scale-105 active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Open Phone SMS</span>
              </button>
            </div>

            {/* Summary Details Pill */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Procurement Mandi</span>
                <strong className="text-slate-800 block text-xs mt-0.5">{createdRecord.centreName}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Harvest Date</span>
                <strong className="text-slate-800 block text-xs mt-0.5">{formatDate(createdRecord.harvestDate)}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Transport</span>
                <strong className="text-slate-800 block text-xs mt-0.5">{createdRecord.transportMode}</strong>
              </div>
            </div>

            {/* Action Buttons */}
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

          {/* Edit Booking Modal */}
          {isEditModalOpen && (
            <EditBookingModal
              procurement={createdRecord}
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onSave={handleSaveEdit}
              secondsLeft={secondsRemaining}
            />
          )}

        </div>
      )}

    </div>
  );
};
