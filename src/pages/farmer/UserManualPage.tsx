import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppState } from '../../context/AppStateContext';
import { USER_MANUAL_DATA, StepGuide } from '../../data/userManualData';
import { Language } from '../../types';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  FileText,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Printer,
  Sparkles,
  PhoneCall,
  ArrowLeft,
  Info,
  Calendar,
  Building2,
  Scale,
  Wheat,
  UserCheck,
  Check
} from 'lucide-react';

export const UserManualPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { isAuthenticated, role } = useAppState();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'ALL' | 'STEPS' | 'CHECKLIST' | 'FAQS'>('ALL');
  const [selectedStepNumber, setSelectedStepNumber] = useState<number | null>(null);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const content = USER_MANUAL_DATA[language] || USER_MANUAL_DATA.en;

  const toggleDocCheck = (id: string) => {
    setCheckedDocs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getDocIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-emerald-600" />;
      case 'FileText':
        return <FileText className="w-6 h-6 text-blue-600" />;
      case 'CreditCard':
        return <CreditCard className="w-6 h-6 text-purple-600" />;
      case 'Smartphone':
        return <Smartphone className="w-6 h-6 text-amber-600" />;
      default:
        return <FileText className="w-6 h-6 text-emerald-600" />;
    }
  };

  const getStepIcon = (num: number) => {
    switch (num) {
      case 1:
        return <UserCheck className="w-5 h-5 text-emerald-600" />;
      case 2:
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 3:
        return <Wheat className="w-5 h-5 text-amber-600" />;
      case 4:
        return <Calendar className="w-5 h-5 text-indigo-600" />;
      case 5:
        return <Scale className="w-5 h-5 text-teal-600" />;
      default:
        return <Building2 className="w-5 h-5 text-slate-600" />;
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

  return (
    <div
      data-no-auto-translate="true"
      className="max-w-5xl mx-auto space-y-6 pb-20 md:pb-12 px-2 sm:px-4 no-auto-translate"
    >
      
      {/* Back Navigation Bar */}
      <div className="no-print flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'or' ? 'ପଛକୁ ଫେରନ୍ତୁ' : language === 'hi' ? 'वापस जाएं' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>{content.printButtonText}</span>
          </button>
        </div>
      </div>

      {/* Main Hero Header Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200">
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {language === 'or'
                  ? 'କୃଷି ଓ କୃଷକ ସଶକ୍ତିକରଣ ବିଭାଗ, ଓଡ଼ିଶା'
                  : language === 'hi'
                  ? 'कृषि एवं किसान कल्याण विभाग'
                  : 'Dept. of Agriculture & Farmers Empowerment'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {content.manualTitle}
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {content.manualSubtitle}
            </p>
          </div>

          {/* Prominent Language Switcher Pill */}
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shrink-0 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-200 text-center">
              {content.languageLabel}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['en', 'hi', 'or'] as Language[]).map((lKey) => (
                <button
                  key={lKey}
                  onClick={() => setLanguage(lKey)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    language === lKey
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md scale-102'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {lKey === 'en' ? 'English' : lKey === 'hi' ? 'हिन्दी' : 'ଓଡ଼ିଆ'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Filter (no-print) */}
      <div className="no-print flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: content.overviewTabLabel, icon: Sparkles },
          { id: 'CHECKLIST', label: content.checklistTabLabel, icon: ShieldCheck },
          { id: 'STEPS', label: content.stepsTabLabel, icon: FileText },
          { id: 'FAQS', label: content.faqTabLabel, icon: HelpCircle }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section 1: Pre-Registration Document Checklist */}
      {(activeTab === 'ALL' || activeTab === 'CHECKLIST') && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>{content.quickChecklistTitle}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {content.quickChecklistSubtitle}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
              {language === 'or' ? 'ପଞ୍ଜୀକରଣ ପାଇଁ ଆବଶ୍ୟକ' : language === 'hi' ? 'पंजीकरण हेतु आवश्यक' : 'Ready Checklist'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {content.documents.map((doc) => {
              const isChecked = !!checkedDocs[doc.id];
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleDocCheck(doc.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isChecked
                      ? 'bg-emerald-50/70 border-emerald-400 shadow-2xs'
                      : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/60'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-300 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-white border border-slate-200 shadow-2xs">
                        {getDocIcon(doc.iconName)}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        {doc.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">
                      {doc.description}
                    </p>
                    <div className="text-[11px] text-emerald-800 font-medium bg-white/80 rounded px-2 py-0.5 border border-emerald-100 inline-block">
                      📌 {doc.whereToFind}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 2: Step-by-Step Interactive Guide */}
      {(activeTab === 'ALL' || activeTab === 'STEPS') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-700" />
              <span>{content.stepsTabLabel}</span>
            </h2>
            <span className="text-xs text-slate-500">
              5 {language === 'or' ? 'ଟି ପର୍ଯ୍ୟାୟ' : language === 'hi' ? 'चरण' : 'Simple Steps'}
            </span>
          </div>

          <div className="space-y-4">
            {content.steps.map((st) => {
              const isSelected = selectedStepNumber === st.stepNumber;
              return (
                <div
                  key={st.stepNumber}
                  id={`step-${st.stepNumber}`}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                >
                  {/* Step Header Bar */}
                  <div
                    onClick={() =>
                      setSelectedStepNumber(isSelected ? null : st.stepNumber)
                    }
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                        {getStepIcon(st.stepNumber)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            {st.badge}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                          {st.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {st.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {st.fieldsToFill.length} {language === 'or' ? 'ଟି ତଥ୍ୟ' : language === 'hi' ? 'विवरण' : 'Fields'}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isSelected ? 'rotate-90 text-emerald-700' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Step Content: What Information to Fill In */}
                  <div className="p-4 sm:p-6 space-y-4 bg-slate-50/40">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{content.whatToFillTitle}</span>
                      </h4>

                      <div className="grid grid-cols-1 gap-2.5">
                        {st.fieldsToFill.map((field, fIdx) => (
                          <div
                            key={fIdx}
                            className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs sm:text-sm font-bold text-slate-900">
                                  {field.fieldName}
                                </span>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                    field.required
                                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  {field.required ? content.requiredBadge : content.optionalBadge}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600">
                                {field.description}
                              </p>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-800 shrink-0 self-start md:self-auto max-w-full truncate">
                              {field.example}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pro Tips Box */}
                    {st.tips.length > 0 && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{content.proTipLabel}</span>
                        </div>
                        <ul className="text-xs text-emerald-800 list-disc list-inside space-y-1 ml-1">
                          {st.tips.map((tip, tIdx) => (
                            <li key={tIdx} className="leading-relaxed">
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 3: FAQs & Helpline */}
      {(activeTab === 'ALL' || activeTab === 'FAQS') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-700" />
              <span>{content.faqTabLabel}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {content.faqs.map((faq, fIdx) => (
              <div
                key={fIdx}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    Q
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {faq.question}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          {/* Toll-Free Helpline Banner */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                <PhoneCall className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {content.helplineTitle}
                </h3>
                <p className="text-xs text-amber-100">
                  {content.helplineDesc}
                </p>
              </div>
            </div>

            <div className="bg-white text-slate-900 px-5 py-2.5 rounded-xl font-mono font-black text-base sm:text-lg shadow-sm border border-amber-300 shrink-0">
              📞 {content.tollFreeNumber}
            </div>
          </div>
        </div>
      )}

      {/* Action Footer Bar (no-print) */}
      <div className="no-print bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            {language === 'or'
              ? 'ସବୁ କାଗଜପତ୍ର ପ୍ରସ୍ତୁତ ଅଛି କି?'
              : language === 'hi'
              ? 'क्या आपके सभी दस्तावेज तैयार हैं?'
              : 'Ready to proceed with your crop registration?'}
          </h4>
          <p className="text-xs text-slate-500">
            {language === 'or'
              ? 'ମାତ୍ର ୩ ମିନିଟରେ ଆପଣଙ୍କ ଫସଲ ପଞ୍ଜୀକରଣ କରନ୍ତୁ ଓ ମଣ୍ଡି ସ୍ଲଟ୍ ନିଶ୍ଚିତ କରନ୍ତୁ।'
              : language === 'hi'
              ? 'सिर्फ 3 मिनट में अपनी फसल का विवरण भरें और टोकन प्राप्त करें।'
              : 'Complete your registration in under 3 minutes and receive your guaranteed token pass.'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isAuthenticated && role === 'FARMER' ? (
            <Link
              to="/farmer/register-crop"
              className="w-full sm:w-auto text-center px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{language === 'or' ? 'ଫସଲ ପଞ୍ଜୀକରଣ ଆରମ୍ଭ କରନ୍ତୁ' : language === 'hi' ? 'फसल पंजीकरण शुरू करें' : 'Start Crop Registration'}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full sm:w-auto text-center px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{content.registerNowBtn}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

    </div>
  );
};
