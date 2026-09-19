import React, { useState, useEffect } from 'react';
import { Clock, Edit3, XCircle, CheckCircle } from 'lucide-react';

interface GracePeriodCountdownProps {
  bookingTimestamp: string;
  onEditClick: () => void;
  onCancelClick: () => void;
  isCancelled?: boolean;
  compact?: boolean;
  onExpire?: () => void;
}

export const GracePeriodCountdown: React.FC<GracePeriodCountdownProps> = ({
  bookingTimestamp,
  onEditClick,
  onCancelClick,
  isCancelled = false,
  compact = false,
  onExpire
}) => {
  const calculateSecondsLeft = () => {
    if (!bookingTimestamp) return 0;
    const bookingTime = new Date(bookingTimestamp).getTime();
    if (isNaN(bookingTime)) return 0;
    const elapsed = Date.now() - bookingTime;
    const remaining = Math.max(0, Math.ceil((60 * 1000 - elapsed) / 1000));
    return remaining;
  };

  const [secondsLeft, setSecondsLeft] = useState<number>(calculateSecondsLeft);
  const [hasExpired, setHasExpired] = useState<boolean>(calculateSecondsLeft() <= 0);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateSecondsLeft();
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        if (!hasExpired) {
          setHasExpired(true);
          onExpire?.();
        }
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingTimestamp, hasExpired, onExpire]);

  if (isCancelled) {
    return null;
  }

  const isGraceActive = secondsLeft > 0;
  const progressPercent = Math.max(0, Math.min(100, (secondsLeft / 60) * 100));

  // Compact Mode (for list items or dashboard hero cards)
  if (compact) {
    if (isGraceActive) {
      return (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 border border-amber-300 rounded-2xl px-3.5 py-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>1-Min Window:</span>
              <span className="font-mono text-sm font-black bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-lg">
                00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onEditClick}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              onClick={onCancelClick}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <XCircle className="w-3 h-3" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        <span>Booking Locked (1-min grace ended)</span>
      </div>
    );
  }

  // Full Featured Banner (for Booking Success / Confirmation Page)
  return (
    <div
      className={`rounded-2xl transition-all duration-300 overflow-hidden border ${
        isGraceActive
          ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/60 border-amber-300 shadow-md ring-1 ring-amber-400/20'
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}
    >
      {/* Top progress bar */}
      {isGraceActive && (
        <div className="w-full bg-amber-200/60 h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Info Section */}
          <div className="flex items-start gap-3.5">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                isGraceActive
                  ? 'bg-amber-500 text-white shadow-sm ring-4 ring-amber-400/20'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isGraceActive ? (
                <Clock className="w-5 h-5 animate-pulse" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {isGraceActive ? '1-Minute Mistake Correction Window' : 'Booking Finalized & Secured'}
                </h4>
                {isGraceActive && (
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                {isGraceActive ? (
                  <>
                    Entered wrong crop, quantity, mandi centre, or date? You have a <strong>1-minute grace period</strong> to edit any detail or cancel without penalty.
                  </>
                ) : (
                  <>
                    The 1-minute modification window has concluded. Your appointment has been officially locked with the Mandi system.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Countdown & Action Buttons */}
          <div className="flex flex-wrap items-center sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-200/60">
            {isGraceActive ? (
              <>
                <div className="flex items-center gap-1.5 bg-white/90 border border-amber-300 rounded-xl px-3 py-1.5 shadow-2xs">
                  <span className="text-[11px] uppercase font-bold text-amber-800">Time Left:</span>
                  <span className="font-mono text-base font-black text-amber-950">
                    00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onEditClick}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={onCancelClick}
                  className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel Booking</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Locked for Gate Entry</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
