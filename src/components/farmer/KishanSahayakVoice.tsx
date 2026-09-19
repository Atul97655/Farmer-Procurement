import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic, Sparkles, Globe2, CheckCircle2 } from 'lucide-react';
import { ProcurementRecord } from '../../types';

interface KishanSahayakVoiceProps {
  procurement?: ProcurementRecord | null;
  centreName: string;
  queuePosition?: number;
  estimatedWaitMinutes?: number;
}

type SupportedVoiceLang = 'hi' | 'or' | 'en';

export const KishanSahayakVoice: React.FC<KishanSahayakVoiceProps> = ({
  procurement,
  centreName,
  queuePosition = 3,
  estimatedWaitMinutes = 35
}) => {
  const [selectedLang, setSelectedLang] = useState<SupportedVoiceLang>('hi');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenText, setSpokenText] = useState('');

  const isCancelled = !procurement || procurement.queueStatus === 'Cancelled';

  // Stop speech if unmounting or if token was cancelled
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // When token is cancelled or removed, immediately stop speech and clear old active transcript
  useEffect(() => {
    if (isCancelled) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setSpokenText('');
    }
  }, [isCancelled, procurement?.id, procurement?.queueStatus]);

  const getSpeechScript = (lang: SupportedVoiceLang): string => {
    if (isCancelled) {
      if (lang === 'hi') {
        return 'नमस्कार किसान भाई। वर्तमान में आपका कोई सक्रिय कतार टोकन नहीं है अथवा आपका टोकन रद्द कर दिया गया है। नई तारीख या समय पर स्लॉट बुक करने के लिए कृपया फसल पंजीकरण पर जाएं।';
      }
      if (lang === 'or') {
        return 'ନମସ୍କାର କୃଷକ ଭାଇ। ବର୍ତ୍ତମାନ ଆପଣଙ୍କର କୌଣସି ସକ୍ରିୟ ଟୋକନ୍ ନାହିଁ କିମ୍ବା ଆପଣଙ୍କ ଟୋକନ୍ ବାତିଲ ହୋଇଛି। ନୂତନ ସ୍ଲଟ୍ ବୁକିଂ କରିବା ପାଇଁ ଦୟାକରି ଫସଲ ପଞ୍ଜୀକରଣ କରନ୍ତୁ।';
      }
      return 'Hello respected farmer. You currently do not have an active queue token or your previous token was cancelled. Please book a new slot under Crop Registration.';
    }

    const token = procurement.tokenNumber;
    const crop = procurement.cropType;
    const qty = procurement.declaredQuantity;

    if (lang === 'hi') {
      return `नमस्कार किसान भाई। आपका टोकन नंबर है ${token}। आप ${centreName} पर कतार में नंबर ${queuePosition} पर हैं। हमारी एआई प्रणाली के अनुसार अनुमानित प्रतीक्षा समय लगभग ${estimatedWaitMinutes} मिनट है। आपका ${crop} फसल का भार ${qty} क्विंटल है। कृपया वाहन अनलोडिंग बे के पास तैयार रहें।`;
    }

    if (lang === 'or') {
      // Odia script
      return `ନମସ୍କାର କୃଷକ ଭାଇ। ଆପଣଙ୍କ ଟୋକନ୍ ନମ୍ବର ହେଉଛି ${token}। ଆପଣ ${centreName} ମଣ୍ଡିରେ ଧାଡ଼ି ନମ୍ବର ${queuePosition} ରେ ଅଛନ୍ତି। ଆମର AI ଅନୁଯାୟୀ ଆନୁମାନିକ ଅପେକ୍ଷା ସମୟ ପ୍ରାୟ ${estimatedWaitMinutes} ମିନିଟ୍। ଦୟାକରି ଗାଡ଼ି ସହ ପ୍ରସ୍ତୁତ ରୁହନ୍ତୁ।`;
    }

    return `Hello respected farmer. Your procurement token number is ${token}. You are currently at position number ${queuePosition} in the live queue at ${centreName}. The AI estimated waiting time is approximately ${estimatedWaitMinutes} minutes for ${qty} quintals of ${crop}. Please keep your tractor or vehicle ready near inspection bay.`;
  };

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = getSpeechScript(selectedLang);
    setSpokenText(textToSpeak);

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Configure language code
    if (selectedLang === 'hi') {
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
    } else if (selectedLang === 'or') {
      // Browsers typically synthesize Odia well via hi-IN or en-IN fallback phonetic engine
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
    } else {
      utterance.lang = 'en-IN';
      utterance.rate = 1.0;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-emerald-500/30 overflow-hidden relative">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Assistant Title & Info */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shadow-inner">
            <Sparkles className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                <span>Kishan Sahayak AI</span>
                <span className="text-emerald-400">·</span>
                <span className="text-xs font-normal text-emerald-200">किसान सहायक</span>
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                isCancelled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                  : 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30'
              }`}>
                {isCancelled ? (procurement?.queueStatus === 'Cancelled' ? 'Token Cancelled' : 'No Active Token') : 'Live Voice Status'}
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              {isCancelled
                ? (selectedLang === 'hi'
                    ? 'टोकन रद्द कर दिया गया है। कतार की लाइव घोषणा रोक दी गई है।'
                    : selectedLang === 'or'
                    ? 'ଟୋକନ୍ ବାତିଲ ହୋଇଛି। ଲାଇଭ୍ ଘୋଷଣା ସ୍ଥଗିତ ରଖାଯାଇଛି।'
                    : 'Token is cancelled. Live queue audio announcements are suspended.')
                : (selectedLang === 'hi'
                    ? 'ऑडियो अपडेट पसंद करने वाले किसानों के लिए कतार स्थिति एवं दिशानिर्देश।'
                    : selectedLang === 'or'
                    ? 'ଅଡିଓ ଅପଡେଟ୍ ପସନ୍ଦ କରୁଥିବା କୃଷକଙ୍କ ପାଇଁ ଧାଡ଼ି ସ୍ଥିତି ଏବଂ ନିର୍ଦ୍ଦେଶନାମା।'
                    : 'Spoken queue status & instructions for farmers who prefer audio updates.')}
            </p>
          </div>
        </div>

        {/* Center: Language Selector */}
        <div className="flex items-center gap-1.5 bg-black/30 p-1.5 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setSelectedLang('hi')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedLang === 'hi' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            हिन्दी (Hindi)
          </button>
          <button
            type="button"
            onClick={() => setSelectedLang('or')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedLang === 'or' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            ଓଡ଼ିଆ (Odia)
          </button>
          <button
            type="button"
            onClick={() => setSelectedLang('en')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedLang === 'en' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            English
          </button>
        </div>

        {/* Right: Audio Action Button */}
        <button
          type="button"
          onClick={handleSpeak}
          className={`px-5 py-3 rounded-2xl font-black text-xs flex items-center gap-2.5 shadow-md transition-all cursor-pointer ${
            isSpeaking
              ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400/40 animate-pulse'
              : isCancelled
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-amber-500/20'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-500/20'
          }`}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4" />
              <span>Stop Speaking</span>
              {/* Sound waves animation */}
              <span className="flex items-center gap-0.5 ml-1">
                <span className="w-1 h-3 bg-white rounded-full animate-bounce"></span>
                <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1 h-2 bg-white rounded-full animate-bounce [animation-delay:0.3s]"></span>
              </span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>
                {isCancelled
                  ? (selectedLang === 'hi' ? 'रद्द स्थिति सुनें' : selectedLang === 'or' ? 'ବାତିଲ ସ୍ଥିତି ଶୁଣନ୍ତୁ' : 'Hear Cancellation Status')
                  : (selectedLang === 'hi' ? 'मेरी कतार स्थिति सुनें' : selectedLang === 'or' ? 'ମୋର ଧାଡ଼ି ସ୍ଥିତି ଶୁଣନ୍ତୁ' : 'Listen to My Queue Status')}
              </span>
            </>
          )}
        </button>

      </div>

      {/* Transcription Banner if spoken */}
      {spokenText && (
        <div className="mt-4 pt-3 border-t border-emerald-700/50 flex items-start gap-2 text-xs text-emerald-100/90 leading-relaxed bg-black/20 p-3 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-300 block text-[11px] uppercase tracking-wider mb-0.5">
              Spoken Transcript ({selectedLang.toUpperCase()}):
            </span>
            <p className="italic">"{spokenText}"</p>
          </div>
        </div>
      )}

    </div>
  );
};
