import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  UserCheck,
  Building2,
  ShieldCheck,
  Shield,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  User,
  Mail,
  KeyRound,
  FileCheck,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { UserManualModal } from '../../components/farmer/UserManualModal';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { farmers, centres, loginFarmer, registerFarmer, loginOperator, loginAdmin } = useAppState();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'FARMER' | 'OPERATOR' | 'ADMIN'>('FARMER');
  const [farmerSubTab, setFarmerSubTab] = useState<'LOGIN' | 'REGISTER' | 'REGISTRY'>('LOGIN');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Farmer Login
  const [mobileNumber, setMobileNumber] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [farmerEmail, setFarmerEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('782941');

  // Farmer Registration
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDistrict, setRegDistrict] = useState('Bargarh');
  const [regVillage, setRegVillage] = useState('');
  const [regLandAcres, setRegLandAcres] = useState('4.5');
  const [regCrop, setRegCrop] = useState('Paddy (Common)');
  const [regBankName, setRegBankName] = useState('State Bank of India');
  const [regAccount, setRegAccount] = useState('');

  // Operator Login
  const [operatorId, setOperatorId] = useState('op.digha@kisanq.gov.in');
  const [operatorCentreId, setOperatorCentreId] = useState('c-1');
  const [operatorPin, setOperatorPin] = useState('1234');

  // Admin Login
  const [adminEmail, setAdminEmail] = useState('admin@kisanq.gov.in');
  const [adminPin, setAdminPin] = useState('admin2026');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.replace(/\D/g, '').length < 10) {
      setStatusMsg({ type: 'error', text: 'Please enter a 10-digit mobile number' });
      return;
    }
    const gen = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(gen);
    setOtpSent(true);
    setStatusMsg({ type: 'success', text: 'SMS OTP generated for verification' });
  };

  const handleFarmerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const farmer = loginFarmer({
      phone: mobileNumber || '9876543210',
      name: farmerName || undefined,
      email: farmerEmail || undefined
    });
    setStatusMsg({ type: 'success', text: 'Welcome, ' + farmer.name + '! Redirecting...' });
    setTimeout(() => {
      navigate('/farmer/dashboard');
    }, 300);
  };

  const handleFarmerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter farmer full name' });
      return;
    }
    if (!regPhone || regPhone.replace(/\D/g, '').length < 10) {
      setStatusMsg({ type: 'error', text: 'Please enter a 10-digit mobile number' });
      return;
    }
    const created = registerFarmer({
      name: regName,
      phone: regPhone,
      district: regDistrict,
      village: regVillage || 'Gram Panchayat Center',
      landAreaAcres: parseFloat(regLandAcres) || 3.5,
      bankName: regBankName,
      bankAccountNumber: regAccount ? 'XXXXXXXX' + regAccount.slice(-4) : 'XXXXXXXX9124',
      ifscCode: 'SBIN0001234'
    });
    setStatusMsg({ type: 'success', text: 'Registration Successful! Welcome, ' + created.name });
    setTimeout(() => {
      navigate('/farmer/dashboard');
    }, 300);
  };

  const handleOperatorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const centre = centres.find(c => c.id === operatorCentreId);
    loginOperator({
      emailOrId: operatorId,
      centreId: operatorCentreId,
      name: centre ? centre.officerInCharge : 'Mandi Yard Operator'
    });
    setStatusMsg({ type: 'success', text: 'Operator Authentication Verified! Loading Mandi Yard...' });
    setTimeout(() => {
      navigate('/centre/dashboard');
    }, 300);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAdmin({
      emailOrId: adminEmail,
      name: 'Director of Agri Marketing & Logistics'
    });
    setStatusMsg({ type: 'success', text: 'State Admin Authentication Verified! Loading Dashboard...' });
    setTimeout(() => {
      navigate('/admin/dashboard');
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 px-3.5 py-1 rounded-full text-xs font-bold border border-emerald-300 shadow-2xs">
          <Shield className="w-3.5 h-3.5 text-emerald-700" />
          <span>Ministry of Agriculture & Farmers Welfare · Government of India</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          KISAN<span className="text-emerald-700">-Q</span> National Procurement Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Unified digital platform connecting Farmers, Mandi Operators, and State Authorities for scheduled crop procurement and instant DBT.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => { setActiveTab('FARMER'); setStatusMsg(null); }}
            className={'py-4 px-3 text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ' + (
              activeTab === 'FARMER'
                ? 'bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Farmer Portal</span>
          </button>

          <button
            onClick={() => { setActiveTab('OPERATOR'); setStatusMsg(null); }}
            className={'py-4 px-3 text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ' + (
              activeTab === 'OPERATOR'
                ? 'bg-white text-blue-800 border-b-2 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Mandi Operator</span>
          </button>

          <button
            onClick={() => { setActiveTab('ADMIN'); setStatusMsg(null); }}
            className={'py-4 px-3 text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ' + (
              activeTab === 'ADMIN'
                ? 'bg-white text-purple-800 border-b-2 border-purple-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>State Admin</span>
          </button>
        </div>

        {statusMsg && (
          <div
            className={'m-6 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ' + (
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            )}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMsg.text}</span>
          </div>
        )}

        {activeTab === 'FARMER' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => setFarmerSubTab('LOGIN')}
                  className={'px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ' + (
                    farmerSubTab === 'LOGIN' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  Mobile & OTP Login
                </button>
                <button
                  type="button"
                  onClick={() => setFarmerSubTab('REGISTER')}
                  className={'px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ' + (
                    farmerSubTab === 'REGISTER' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  New Farmer Registration
                </button>
                <button
                  type="button"
                  onClick={() => setFarmerSubTab('REGISTRY')}
                  className={'px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ' + (
                    farmerSubTab === 'REGISTRY' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  Verified Registry
                </button>
              </div>

              {/* User Manual quick button */}
              <button
                type="button"
                onClick={() => setIsManualModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Open Farmer User Manual & Registration Guide"
              >
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>
                  {language === 'or' ? 'କୃଷକ ମାନୁଆଲ' : language === 'hi' ? 'किसान गाइड' : 'Farmer User Manual'}
                </span>
              </button>
            </div>

            {farmerSubTab === 'LOGIN' && (
              <form onSubmit={otpSent ? handleFarmerLogin : handleSendOtp} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Farmer Mobile Number (+91)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                      +91
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Farmer Full Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={farmerEmail}
                      onChange={(e) => setFarmerEmail(e.target.value)}
                      placeholder="e.g. ramesh.farmer@agri.in"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {otpSent && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900">SMS OTP Verification</span>
                      <span className="text-[11px] font-mono text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                        SMS OTP: <strong>{simulatedOtp}</strong>
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-amber-300 bg-white font-mono text-center tracking-widest font-bold text-base focus:outline-none focus:border-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={() => setOtpCode(simulatedOtp)}
                        className="px-3 py-2 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  {!otpSent ? (
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Get Instant OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Enter Portal</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      loginFarmer({ phone: '9876543210', name: 'Ramesh Kumar', email: 'ramesh.farmer@agri.in' });
                      navigate('/farmer/dashboard');
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-4 rounded-2xl text-xs transition-colors cursor-pointer"
                  >
                    Direct Sign In (Ramesh)
                  </button>
                </div>
              </form>
            )}

            {farmerSubTab === 'REGISTER' && (
              <div className="space-y-4 max-w-2xl">
                {/* Farmer Registration Guidance Banner */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-700 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                      <BookOpen className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {language === 'or' ? 'କୃଷକ ପଞ୍ଜୀକରଣ ମାର୍ଗଦର୍ଶିକା (User Manual)' : language === 'hi' ? 'किसान पंजीकरण उपयोगकर्ता पुस्तिका' : 'Farmer Registration Manual & Guide'}
                      </h4>
                      <p className="text-xs text-slate-600 leading-snug">
                        {language === 'or' ? 'ପଞ୍ଜୀକରଣ ପାଇଁ କେଉଁ କେଉଁ କାଗଜପତ୍ର ଓ ତଥ୍ୟ ପୂରଣ କରିବାକୁ ହେବ ତାହା ପଢନ୍ତୁ।' : language === 'hi' ? 'फॉर्म भरने से पहले आवश्यक दस्तावेज और जानकारी जानने के लिए मार्गदर्शिका पढ़ें।' : 'Review what information and documents you need to fill in before proceeding.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setIsManualModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{language === 'or' ? 'ମାନୁଆଲ' : language === 'hi' ? 'पुस्तिका' : 'Read Guide'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/user-manual')}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                      title="Open Full Page Guide"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleFarmerRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Farmer Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile number"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      District
                    </label>
                    <select
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-emerald-600 bg-white"
                    >
                      <option value="Bargarh">Bargarh</option>
                      <option value="Sambalpur">Sambalpur</option>
                      <option value="Cuttack">Cuttack</option>
                      <option value="Balasore">Balasore</option>
                      <option value="Puri">Puri</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Village / Gram Panchayat
                    </label>
                    <input
                      type="text"
                      value={regVillage}
                      onChange={(e) => setRegVillage(e.target.value)}
                      placeholder="Enter village name"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Land Holding (Acres)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={regLandAcres}
                      onChange={(e) => setRegLandAcres(e.target.value)}
                      placeholder="4.5"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Primary Crop
                    </label>
                    <select
                      value={regCrop}
                      onChange={(e) => setRegCrop(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-emerald-600 bg-white"
                    >
                      <option value="Paddy (Common)">Paddy (Common)</option>
                      <option value="Paddy (Grade A)">Paddy (Grade A)</option>
                      <option value="Wheat (Sharbati)">Wheat (Sharbati)</option>
                      <option value="Mustard">Mustard</option>
                      <option value="Maize">Maize</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Bank Name (for DBT)
                    </label>
                    <input
                      type="text"
                      value={regBankName}
                      onChange={(e) => setRegBankName(e.target.value)}
                      placeholder="State Bank of India"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      value={regAccount}
                      onChange={(e) => setRegAccount(e.target.value)}
                      placeholder="Account Number"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Register Farmer & Open Dashboard</span>
                  </button>
                </div>
                </form>
              </div>
            )}

            {farmerSubTab === 'REGISTRY' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-medium">
                  Select any verified farmer account to sign in directly:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {farmers.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => {
                        loginFarmer({ phone: f.phone, name: f.name });
                        navigate('/farmer/dashboard');
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-800">{f.name}</div>
                        <div className="text-xs text-slate-500">{f.district} · {f.phone}</div>
                        <div className="text-[11px] font-mono text-emerald-700">ID: {f.id}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-1" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'OPERATOR' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="max-w-lg space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mandi Procurement Centre *
                </label>
                <select
                  value={operatorCentreId}
                  onChange={(e) => setOperatorCentreId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-600 bg-white"
                >
                  {centres.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Operator Official ID / Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={operatorId}
                    onChange={(e) => setOperatorId(e.target.value)}
                    placeholder="op.digha@kisanq.gov.in"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Security Passcode / PIN
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={operatorPin}
                    onChange={(e) => setOperatorPin(e.target.value)}
                    placeholder="Enter PIN"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOperatorLogin}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Authenticate & Launch Mandi Terminal</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ADMIN' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="max-w-lg space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  State Admin Official Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@kisanq.gov.in"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Gov Authorization Security Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Enter Admin Code"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAdminLogin}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In to State Command Portal</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Farmer User Manual & Registration Guide Modal */}
      <UserManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        defaultStep={farmerSubTab === 'REGISTER' ? 1 : 1}
      />
    </div>
  );
};