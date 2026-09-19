import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { USER_MANUAL_DATA, StepGuide } from '../../data/userManualData';
import { Language } from '../../types';
import {
  X,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  FileText,
  ShieldCheck,
  CreditCard,
  Smartphone,
  ExternalLink,
  Printer,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStep?: number;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({
  isOpen,
  onClose,
  defaultStep = 1
}) => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [activeStepIndex, setActiveStepIndex] = useState(defaultStep - 1);
  const [activeTab, setActiveTab] = useState<'STEPS' | 'CHECKLIST' | 'FAQS'>('STEPS');

  if (!isOpen) return null;

  const content = USER_MANUAL_DATA[language] || USER_MANUAL_DATA.en;
  const currentStep: StepGuide = content.steps[activeStepIndex] || content.steps[0];

  const getDocIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5 text-purple-600" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 text-amber-600" />;
      default:
        return <FileText className="w-5 h-5 text-emerald-600" />;
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = 'KISAN-Q_Farmer_User_Manual';
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleGoToRegistration = () => {
    onClose();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        data-no-auto-translate="true"
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden no-auto-translate"
      >
        
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 sm:p-5 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 mt-0.5 border border-white/20 shadow-inner">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-emerald-900/50 px-2 py-0.5 rounded">
                  KISAN-Q Guide
                </span>
                <span className="text-xs text-amber-300 font-medium">
                  {language === 'or' ? 'ସଂକ୍ଷିପ୍ତ ମାର୍ଗଦର୍ଶିକା' : language === 'hi' ? 'संक्षिप्त गाइड' : 'Quick Guide'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1 leading-snug">
                {content.manualTitle}
              </h2>
              <p className="text-xs text-emerald-100 line-clamp-1 mt-0.5">
                {content.manualSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trilingual Language Selector Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700">
              {language === 'or' ? 'ଭାଷା ବାଛନ୍ତୁ:' : language === 'hi' ? 'भाषा चुनें:' : 'Language:'}
            </span>
            <div className="inline-flex bg-white rounded-lg p-0.5 border border-slate-300 shadow-2xs">
              {(['en', 'hi', 'or'] as Language[]).map((langKey) => (
                <button
                  key={langKey}
                  onClick={() => setLanguage(langKey)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    language === langKey
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {langKey === 'en' ? 'English' : langKey === 'hi' ? 'हिन्दी' : 'ଓଡ଼ିଆ'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>{content.printButtonText}</span>
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 text-xs sm:text-sm font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('STEPS')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'STEPS'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{content.stepsTabLabel}</span>
          </button>
          <button
            onClick={() => setActiveTab('CHECKLIST')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'CHECKLIST'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{content.checklistTabLabel}</span>
          </button>
          <button
            onClick={() => setActiveTab('FAQS')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'FAQS'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{content.faqTabLabel}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 space-y-4">
          {activeTab === 'STEPS' && (
            <div className="space-y-4">
              {/* Step Navigation Pills */}
              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {content.steps.map((st, idx) => (
                  <button
                    key={st.stepNumber}
                    onClick={() => setActiveStepIndex(idx)}
                    className={`py-2 px-1 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center ${
                      activeStepIndex === idx
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50'
                    }`}
                  >
                    <span className="text-[10px] sm:text-xs opacity-90">
                      {language === 'or' ? 'ପର୍ଯ୍ୟାୟ' : language === 'hi' ? 'चरण' : 'Step'} {st.stepNumber}
                    </span>
                    <span className="text-[11px] font-semibold truncate max-w-full hidden sm:inline">
                      {st.title.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Current Step Card */}
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mb-1">
                      {currentStep.badge}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {currentStep.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {currentStep.subtitle}
                    </p>
                  </div>
                </div>

                {/* Fields to Fill list */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    {content.whatToFillTitle}
                  </h4>
                  <div className="space-y-2">
                    {currentStep.fieldsToFill.map((field, fIdx) => (
                      <div
                        key={fIdx}
                        className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {field.fieldName}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                field.required
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {field.required ? content.requiredBadge : content.optionalBadge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            {field.description}
                          </p>
                        </div>
                        <div className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-mono text-emerald-800 shrink-0 self-start">
                          {field.example}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro Tips */}
                {currentStep.tips.length > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{content.proTipLabel}</span>
                    </div>
                    <ul className="text-xs text-emerald-800 list-disc list-inside space-y-0.5 ml-1">
                      {currentStep.tips.map((tip, tIdx) => (
                        <li key={tIdx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Step Navigation Next/Back */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {language === 'or' ? 'ପୂର୍ବ ପର୍ଯ୍ୟାୟ' : language === 'hi' ? 'पिछला चरण' : 'Previous Step'}
                </button>

                <span className="text-xs text-slate-500 font-medium">
                  {activeStepIndex + 1} / {content.steps.length}
                </span>

                <button
                  disabled={activeStepIndex === content.steps.length - 1}
                  onClick={() => setActiveStepIndex((prev) => Math.min(content.steps.length - 1, prev + 1))}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  <span>{language === 'or' ? 'ପରବର୍ତ୍ତୀ ପର୍ଯ୍ୟାୟ' : language === 'hi' ? 'अगला चरण' : 'Next Step'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'CHECKLIST' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 font-medium">
                <strong>{content.quickChecklistTitle}:</strong> {content.quickChecklistSubtitle}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {content.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                      {getDocIcon(doc.iconName)}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900">
                        {doc.name}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {doc.description}
                      </p>
                      <div className="text-[11px] text-emerald-700 font-medium bg-emerald-50/60 rounded px-2 py-0.5 border border-emerald-100">
                        {doc.whereToFind}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'FAQS' && (
            <div className="space-y-3">
              {content.faqs.map((faq, fIdx) => (
                <div
                  key={fIdx}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-1.5"
                >
                  <div className="flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {faq.question}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}

              {/* Toll-free support box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full bg-amber-100 text-amber-800">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-amber-950">
                      {content.helplineTitle}
                    </h5>
                    <p className="text-[11px] text-amber-800">
                      {content.helplineDesc}
                    </p>
                  </div>
                </div>
                <span className="text-sm sm:text-base font-black text-amber-900 tracking-wide font-mono bg-white px-3 py-1 rounded-lg border border-amber-300 shadow-2xs">
                  {content.tollFreeNumber}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            {language === 'or' ? 'ବନ୍ଦ କରନ୍ତୁ' : language === 'hi' ? 'बंद करें' : 'Close'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                navigate('/user-manual');
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>{language === 'or' ? 'ସମ୍ପୂର୍ଣ୍ଣ ପୃଷ୍ଠା ଦେଖନ୍ତୁ' : language === 'hi' ? 'पूरा पृष्ठ देखें' : 'Open Full Page'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleGoToRegistration}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>{content.registerNowBtn}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
