import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Volume2, Globe, User, RotateCcw, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppState } from '../../context/AppStateContext';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

export const FarmerAiAssistant: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { activeFarmer, procurements, centres } = useAppState();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active procurement record for context
  const activeProcurement = procurements.find(
    p => p.farmerId === activeFarmer?.id && p.queueStatus !== 'Cancelled'
  );
  const currentCentre = centres.find(c => c.id === activeProcurement?.centreId) || centres[0];

  // Multilingual Initial Greetings & Quick Prompts
  const greetings: Record<'en' | 'hi' | 'or', { title: string; subtitle: string; initial: string; prompts: string[] }> = {
    en: {
      title: 'Kisan-Q AI Sahayak',
      subtitle: 'Multilingual Farmer Assistant & Mandi Guide',
      initial: `Namaste ${activeFarmer?.name || 'Farmer'} ji! 🙏 I am your Kisan-Q AI Assistant. I can help you with slot booking, live token queue tracking, MSP rates, and quality check guidelines. How can I assist you today?`,
      prompts: [
        'How do I book a mandi slot?',
        'Where is my active token and queue status?',
        'What are the FCI quality & moisture limits?',
        'What is the MSP rate for paddy?'
      ]
    },
    hi: {
      title: 'किसान-Q एआई सहायक',
      subtitle: 'त्रिभाषी किसान सहायक एवं मंडी मार्गदर्शक',
      initial: `नमस्ते ${activeFarmer?.name || 'किसान'} जी! 🙏 मैं आपका किसान-Q एआई सहायक हूँ। मैं आपकी स्लॉट बुकिंग, लाइव टोकन कतार, न्यूनतम समर्थन मूल्य (MSP) और गुणवत्ता जांच में सहायता कर सकता हूँ। बताएं, मैं आपकी क्या मदद करूँ?`,
      prompts: [
        'मंडी में स्लॉट कैसे बुक करें?',
        'मेरा टोकन नंबर और कतार में स्थान क्या है?',
        'एफसीआई (FCI) अनाज गुणवत्ता व नमी के क्या नियम हैं?',
        'धान का न्यूनतम समर्थन मूल्य (MSP) क्या है?'
      ]
    },
    or: {
      title: 'କିଷାନ-Q ଏଆଇ ସହାୟକ',
      subtitle: 'ତ୍ରିଭାଷୀ କୃଷକ ସହାୟତା ଓ ମଣ୍ଡି ମାର୍ଗଦର୍ଶକ',
      initial: `ନମସ୍କାର ${activeFarmer?.name || 'କୃଷକ'} ଆଜ୍ଞା! 🙏 ମୁଁ ଆପଣଙ୍କ କିଷାନ-Q ଏଆଇ ସହାୟକ। ମୁଁ ଆପଣଙ୍କ ସ୍ଲଟ୍ ବୁକିଂ, ଲାଇଭ୍ ଟୋକନ୍ ଧାଡ଼ି ସ୍ଥିତି, ସର୍ବନିମ୍ନ ସହାୟକ ମୂଲ୍ୟ (MSP) ଏବଂ ଗୁଣବତ୍ତା ଯାଞ୍ଚ ସମ୍ପର୍କରେ ସାହାଯ୍ୟ କରିପାରିବି। କୁହନ୍ତୁ, ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିବି?`,
      prompts: [
        'ମଣ୍ଡିରେ ସ୍ଲଟ୍ କିପରି ବୁକ୍ କରିବି?',
        'ମୋର ଟୋକନ୍ ନମ୍ବର ଏବଂ ଧାଡ଼ିର ସ୍ଥିତି କ’ଣ?',
        'FCI ଶସ୍ୟ ଗୁଣବତ୍ତା ଓ ଆର୍ଦ୍ରତା ନିୟମ କ’ଣ?',
        'ଧାନର ସର୍ବନିମ୍ନ ସହାୟକ ମୂଲ୍ୟ (MSP) କେତେ?'
      ]
    }
  };

  const currentLang = (language === 'hi' || language === 'or' || language === 'en') ? language : 'en';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: greetings[currentLang].initial,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: greetings[currentLang].prompts
    }
  ]);

  // Sync initial welcome when language changes if chat is fresh
  useEffect(() => {
    setMessages(prev => {
      if (prev.length <= 1) {
        return [{
          id: 'welcome',
          sender: 'ai',
          text: greetings[currentLang].initial,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: greetings[currentLang].prompts
        }];
      }
      return prev;
    });
  }, [currentLang]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Intelligent Context-Aware Response Engine
  const generateAiResponse = (query: string, lang: 'en' | 'hi' | 'or'): { text: string; prompts: string[] } => {
    const q = query.toLowerCase();

    // 1. Queue Status & Token Queries
    if (q.includes('token') || q.includes('queue') || q.includes('कतार') || q.includes('टोकन') || q.includes('status') || q.includes('ଧାଡ଼ି') || q.includes('ଟୋକନ୍')) {
      if (activeProcurement) {
        if (lang === 'hi') {
          return {
            text: `आपके पास सक्रिय टोकन है: **#${activeProcurement.tokenNumber}**। \n📍 मंडी: **${activeProcurement.centreName}**\n⏳ स्थिति: **${activeProcurement.queueStatus}**\n🚜 कतार में स्थान: **${activeProcurement.queuePosition}** (अनुमानित प्रतीक्षा समय: लगभग ${activeProcurement.estimatedWaitMinutes} मिनट)।\nकृपया निर्धारित समय से 15 मिनट पूर्व गेट नं. 1 पर पहुँचें।`,
            prompts: ['गुणवत्ता जांच कैसे होती है?', 'भुगतान कब मिलेगा?']
          };
        } else if (lang === 'or') {
          return {
            text: `ଆପଣଙ୍କ ସକ୍ରିୟ ଟୋକନ୍ ନମ୍ବର: **#${activeProcurement.tokenNumber}**। \n📍 ମଣ୍ଡି: **${activeProcurement.centreName}**\n⏳ ସ୍ଥିତି: **${activeProcurement.queueStatus}**\n🚜 ଧାଡ଼ିରେ ସ୍ଥାନ: **${activeProcurement.queuePosition}** (ଆନୁମାନିକ ଅପେକ୍ଷା ସମୟ: ପ୍ରାୟ ${activeProcurement.estimatedWaitMinutes} ମିନିଟ୍)।\nଦୟାକରି ନିର୍ଦ୍ଧାରିତ ସମୟର ୧୫ ମିନିଟ୍ ପୂର୍ବରୁ ଗେଟ୍ ନଂ. ୧ ରେ ପହଞ୍ଚନ୍ତୁ।`,
            prompts: ['ଗୁଣବତ୍ତା ଯାଞ୍ଚ ନିୟମ କ’ଣ?', 'ଟଙ୍କା କେବେ ମିଳିବ?']
          };
        } else {
          return {
            text: `You have an active booking: Token **#${activeProcurement.tokenNumber}**.\n📍 Centre: **${activeProcurement.centreName}**\n⏳ Status: **${activeProcurement.queueStatus}**\n🚜 Queue Position: **#${activeProcurement.queuePosition}** (~${activeProcurement.estimatedWaitMinutes} mins estimated wait).\nPlease arrive at Gate 1 with your photo ID and land records 15 minutes before your time slot.`,
            prompts: ['What are the quality check rules?', 'When will payment be credited?']
          };
        }
      } else {
        if (lang === 'hi') {
          return {
            text: `वर्तमान में आपका कोई सक्रिय स्लॉट या टोकन बुक नहीं है। आप **"फसल पंजीकरण"** टैब पर जाकर अपनी फसल (धान/गेहूं) दर्ज कर सकते हैं और अपनी सुविधानुसार मंडी में पसंदीदा स्लॉट बुक कर सकते हैं।`,
            prompts: ['स्लॉट कैसे बुक करें?', 'धान का न्यूनतम समर्थन मूल्य क्या है?']
          };
        } else if (lang === 'or') {
          return {
            text: `ବର୍ତ୍ତମାନ ଆପଣଙ୍କର କୌଣସି ସକ୍ରିୟ ସ୍ଲଟ୍ କିମ୍ବା ଟୋକନ୍ ନାହିଁ। ଆପଣ **"ଫସଲ ପଞ୍ଜୀକରଣ"** ବିଭାଗକୁ ଯାଇ ଫସଲ ପଞ୍ଜୀକରଣ କରି ନିଜ ପସନ୍ଦର ମଣ୍ଡି ସ୍ଲଟ୍ ବୁକ୍ କରିପାରିବେ।`,
            prompts: ['ସ୍ଲଟ୍ କିପରି ବୁକ୍ କରିବି?', 'ଧାନର ସହାୟକ ମୂଲ୍ୟ କେତେ?']
          };
        } else {
          return {
            text: `You currently do not have an active slot booked. You can register your harvest details under the **"Register Crop"** section and pick your preferred Mandi time slot with zero waiting!`,
            prompts: ['How do I book a slot?', 'What is the MSP rate for paddy?']
          };
        }
      }
    }

    // 2. Booking Process
    if (q.includes('book') || q.includes('slot') || q.includes('बुक') || q.includes('स्लॉट') || q.includes('ବୁକ୍') || q.includes('ସ୍ଲଟ୍') || q.includes('register') || q.includes('पंजीकरण') || q.includes('ପଞ୍ଜୀକରଣ')) {
      if (lang === 'hi') {
        return {
          text: `किसान-Q पर स्लॉट बुक करना 4 सरल चरणों में संभव है:\n1️⃣ **किसान प्रोफाइल**: आपके भूलेख जमीन रिकॉर्ड स्वतः सत्यापित होते हैं।\n2️⃣ **फसल विवरण**: फसल प्रकार, वैरायटी और मात्रा (क्विंटल) दर्ज करें।\n3️⃣ **स्थान**: अपना गाँव व ब्लॉक चुनें।\n4️⃣ **एआई मंडी चयन**: हमारा एआई एल्गोरिदम न्यूनतम कतार और निकटतम दूरी के आधार पर सर्वोत्तम मंडी सुझाएगा। तारीख व समय चुनकर डिजिटल क्यूआर गेट पास प्राप्त करें।`,
          prompts: ['मेरा टोकन नंबर क्या है?', 'गुणवत्ता जांच नियम क्या हैं?']
        };
      } else if (lang === 'or') {
        return {
          text: `କିଷାନ-Q ରେ ସ୍ଲଟ୍ ବୁକିଂ କରିବାର ୪ଟି ସହଜ ପଦକ୍ଷେପ:\n1️⃣ **କୃଷକ ପରିଚୟ**: ଆପଣଙ୍କ ଜମି ପଟ୍ଟା ସ୍ୱୟଂକ୍ରିୟ ଭାବେ ଯାଞ୍ଚ ହୁଏ।\n2️⃣ **ଫସଲ ବିବରଣୀ**: ଫସଲ କିସମ ଓ ପରିମାଣ (କ୍ୱିଣ୍ଟାଲ୍) ଦାଖଲ କରନ୍ତୁ।\n3️⃣ **ଠିକଣା**: ଆପଣଙ୍କ ଗ୍ରାମ ଓ ବ୍ଲକ୍ ବାଛନ୍ତୁ।\n4️⃣ **ଏଆଇ ମଣ୍ଡି ଚୟନ**: ଏଆଇ ସର୍ବନିମ୍ନ ଧାଡ଼ି ଓ କମ୍ ଦୂରତା ଆଧାରରେ ଶ୍ରେଷ୍ଠ ମଣ୍ଡି ସୁପାରିଶ କରିବ। ସମୟ ବାଛି QR ଗେଟ୍ ପାସ୍ ପାଆନ୍ତୁ।`,
          prompts: ['ମୋର ଟୋକନ୍ ନମ୍ବର କ’ଣ?', 'ଗୁଣବତ୍ତା ନିୟମ କ’ଣ?']
        };
      } else {
        return {
          text: `Booking a mandi slot takes 4 simple steps:\n1️⃣ **Farmer Verification**: Pre-validated with State Land Records (Bhulekh).\n2️⃣ **Harvest Details**: Select crop variety and declared quantity in Quintals.\n3️⃣ **Dispatch Location**: Choose village and block.\n4️⃣ **AI Mandi Scoring**: Our ML predictor recommends the centre with the shortest queue and transit time. Confirm to get your instant QR Gate Pass!`,
          prompts: ['Where is my active token?', 'What are the quality standards?']
        };
      }
    }

    // 3. Quality & Moisture Limits (FCI Guidelines)
    if (q.includes('quality') || q.includes('moisture') || q.includes('fci') || q.includes('नमी') || q.includes('गुणवत्ता') || q.includes('आर्द्रता') || q.includes('ଆର୍ଦ୍ରତା') || q.includes('ଗୁଣବତ୍ତା') || q.includes('जांच') || q.includes('ଯାଞ୍ଚ')) {
      if (lang === 'hi') {
        return {
          text: `भारतीय खाद्य निगम (FCI) के मानक नियम:\n💧 **नमी (Moisture)**: अधिकतम 17.0% (आदर्श: 14% से कम)।\n🌾 **विजातीय तत्व (Foreign Matter)**: 2.0% से कम।\n🍂 **क्षतिग्रस्त/टूटा दाना**: 5.0% से कम।\n\n💡 *सलाह*: मंडी लाने से पहले फसल को धूप में अच्छी तरह सुखाएं ताकि आपकी फसल को तुरंत **Grade-A** मिले और बिना किसी कटौती के पूरा मूल्य मिले।`,
          prompts: ['धान का न्यूनतम समर्थन मूल्य क्या है?', 'भुगतान बैंक खाते में कब आता है?']
        };
      } else if (lang === 'or') {
        return {
          text: `FCI ଭାରତୀୟ ଖାଦ୍ୟ ନିଗମର ନିୟମାବଳୀ:\n💧 **ଆର୍ଦ୍ରତା (Moisture)**: ସର୍ବାଧିକ ୧୭.୦% (ଉତ୍ତମ: ୧୪% ରୁ କମ୍)।\n🌾 **ଅଦରକାରୀ ଦ୍ରବ୍ୟ (Foreign Matter)**: ୨.୦% ରୁ କମ୍।\n🍂 **ନଷ୍ଟ ଦାନା (Damaged Grain)**: ୫.୦% ରୁ କମ୍।\n\n💡 *ପରାମର୍ଶ*: ମଣ୍ଡି ଆଣିବା ପୂର୍ବରୁ ଫସଲକୁ ଭଲ ଭାବେ ଖରାରେ ଶୁଖାନ୍ତୁ ଯାହାଦ୍ୱାରା ତୁରନ୍ତ **Grade-A** ମାନ୍ୟତା ମିଳିବ।`,
          prompts: ['ଧାନର MSP କେତେ?', 'ଖାତାକୁ ଟଙ୍କା କେବେ ଆସିବ?']
        };
      } else {
        return {
          text: `Official Food Corporation of India (FCI) Standards:\n💧 **Moisture Limit**: Maximum 17.0% (Optimal: $\\le$ 14.0%).\n🌾 **Foreign Matter / Refraction**: Maximum 2.0%.\n🍂 **Damaged / Discolored Grains**: Maximum 5.0%.\n\n💡 *Tip*: Dry your harvest in the sun before bringing it to the procurement centre to secure an immediate **Grade-A** certification with zero deductions.`,
          prompts: ['What is the MSP rate for paddy?', 'How do DBT payments work?']
        };
      }
    }

    // 4. MSP Rates & Payment (DBT)
    if (q.includes('msp') || q.includes('rate') || q.includes('price') || q.includes('payment') || q.includes('dbt') || q.includes('मूल्य') || q.includes('दाम') || q.includes('भुगतान') || q.includes('ଟଙ୍କା') || q.includes('ମୂଲ୍ୟ') || q.includes('ଦର')) {
      if (lang === 'hi') {
        return {
          text: `वर्तमान सरकारी न्यूनतम समर्थन मूल्य (MSP) दरें:\n🌾 **धान (सामान्य - Common Paddy)**: ₹2,300 प्रति क्विंटल\n🌾 **धान (Grade-A Paddy)**: ₹2,320 प्रति क्विंटल\n🌾 **गेहूं (Wheat)**: ₹2,275 प्रति क्विंटल\n\n💳 **भुगतान प्रक्रिया (DBT)**: डिजिटल धर्मकांटा पर तौल पूर्ण होते ही कंप्यूटर रसीद (J-Form) जारी होती है और 24 से 48 घंटे में PFMS के माध्यम से सीधे आपके बैंक खाते में राशि स्थानांतरित हो जाती है।`,
          prompts: ['मेरा टोकन नंबर क्या है?', 'मंडी में स्लॉट कैसे बुक करें?']
        };
      } else if (lang === 'or') {
        return {
          text: `ସରକାରଙ୍କ ଦ୍ୱାରା ନିର୍ଦ୍ଧାରିତ ସର୍ବନିମ୍ନ ସହାୟକ ମୂଲ୍ୟ (MSP):\n🌾 **ଧାନ (ସାଧାରଣ - Common)**: ₹୨,୩୦୦ ପ୍ରତି କ୍ୱିଣ୍ଟାଲ୍\n🌾 **ଧାନ (ଗ୍ରେଡ୍-A - Grade-A)**: ₹୨,୩୨୦ ପ୍ରତି କ୍ୱିଣ୍ଟାଲ୍\n🌾 **ଗହମ (Wheat)**: ₹୨,୨୭୫ ପ୍ରତି କ୍ୱିଣ୍ଟାଲ୍\n\n💳 **DBT ପ୍ରଦାନ**: ୱେବ୍ରିଜ୍ ରେ ଓଜନ ସରିବା ପରେ J-Form ପ୍ରଦାନ କରାଯାଏ ଏବଂ ୨୪ ରୁ ୪୮ ଘଣ୍ଟା ମଧ୍ୟରେ PFMS ମାଧ୍ୟମରେ ସିଧାସଳଖ ଆପଣଙ୍କ ବ୍ୟାଙ୍କ ଖାତାକୁ ଟଙ୍କା ଯାଏ।`,
          prompts: ['ମୋର ଟୋକନ୍ ନମ୍ବର କ’ଣ?', 'ସ୍ଲଟ୍ କିପରି ବୁକ୍ କରିବି?']
        };
      } else {
        return {
          text: `Government Minimum Support Prices (MSP) for 2026-27:\n🌾 **Paddy (Common)**: ₹2,300 / Quintal\n🌾 **Paddy (Grade A)**: ₹2,320 / Quintal\n🌾 **Wheat**: ₹2,275 / Quintal\n\n💳 **Direct Benefit Transfer (DBT)**: Once verified on the digital weighbridge, a digital J-Form receipt is issued. Payment is credited directly into your linked bank account via PFMS within 24 to 48 hours.`,
          prompts: ['Where is my active token?', 'What are the moisture rules?']
        };
      }
    }

    // Default Fallback Help
    if (lang === 'hi') {
      return {
        text: `मैं आपकी पूरी सहायता करने के लिए तैयार हूँ। आप मुझसे पूछ सकते हैं:\n• अपनी टोकन संख्या व लाइव कतार की स्थिति\n• स्लॉट बुकिंग की प्रक्रिया\n• नमी व गुणवत्ता के सरकारी नियम\n• अपनी फसल का न्यूनतम समर्थन मूल्य (MSP) और भुगतान स्थिति।`,
        prompts: ['मेरा टोकन नंबर क्या है?', 'मंडी में स्लॉट कैसे बुक करें?', 'गुणवत्ता जांच नियम क्या हैं?']
      };
    } else if (lang === 'or') {
      return {
        text: `ମୁଁ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିବାକୁ ପ୍ରସ୍ତୁତ। ଆପଣ ମୋତେ ପଚାରିପାରିବେ:\n• ଆପଣଙ୍କ ଟୋକନ୍ ନମ୍ବର ଓ ଲାଇଭ୍ ଧାଡ଼ି ସ୍ଥିତି\n• ସ୍ଲଟ୍ ବୁକିଂ ନିୟମ\n• FCI ଆର୍ଦ୍ରତା ଓ ଗୁଣବତ୍ତା ନିୟମ\n• ଫସଲର ସହାୟକ ମୂଲ୍ୟ (MSP) ଏବଂ DBT ଟଙ୍କା।`,
        prompts: ['ମୋର ଟୋକନ୍ ନମ୍ବର କ’ଣ?', 'ସ୍ଲଟ୍ କିପରି ବୁକ୍ କରିବି?', 'ଗୁଣବତ୍ତା ନିୟମ କ’ଣ?']
      };
    } else {
      return {
        text: `I'm here to help you navigate Kisan-Q! You can ask me about:\n• Your live token number and yard queue waiting time\n• How to book a convenient mandi procurement slot\n• Official FCI grain quality and moisture specifications\n• MSP pricing and direct bank transfer (DBT) updates.`,
        prompts: ['Where is my active token?', 'How do I book a slot?', 'What are the quality check rules?']
      };
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI reasoning and typing latency
    setTimeout(() => {
      const response = generateAiResponse(text, currentLang);
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: response.prompts
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 450);
  };

  // Text to Speech synthesis for voice assistance in all 3 languages
  const speakMessage = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (activeSpeech === msgId) {
      window.speechSynthesis.cancel();
      setActiveSpeech(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (currentLang === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (currentLang === 'or') {
      utterance.lang = 'or-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95;
    utterance.onend = () => setActiveSpeech(null);
    utterance.onerror = () => setActiveSpeech(null);

    setActiveSpeech(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // If token is cancelled while speech is active, immediately silence speech
  useEffect(() => {
    if (!activeProcurement && activeSpeech) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setActiveSpeech(null);
    }
  }, [activeProcurement, activeSpeech]);

  return (
    <>
      {/* Floating AI Sahayak Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 sm:bottom-24 right-5 sm:right-6 z-40 bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-700 hover:from-amber-400 hover:to-emerald-600 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-xl shadow-emerald-900/30 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/20 group"
        title="Kisan-Q AI Sahayak (24x7 Assistance)"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
          </span>
        </div>
        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="text-xs font-black tracking-wide">
            {currentLang === 'hi' ? 'किसान-Q सहायक' : currentLang === 'or' ? 'କିଷାନ-Q ସହାୟକ' : 'Kisan-Q Sahayak'}
          </span>
          <span className="text-[10px] text-emerald-100 font-medium">
            {currentLang === 'hi' ? '24x7 एआई सहायता' : currentLang === 'or' ? '୨୪x୭ ଏଆଇ ସହାୟତା' : '24x7 Multilingual AI'}
          </span>
        </div>
      </button>

      {/* Slide-Up / Floating Chatbot Window */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-[60] flex items-end justify-center sm:items-auto sm:justify-auto p-0 sm:p-0">
          <div className="w-full sm:w-[420px] h-[92vh] sm:h-[600px] max-h-[92vh] bg-white sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
                  <Bot className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm tracking-tight">{greetings[currentLang].title}</h3>
                    <span className="bg-amber-400/30 text-amber-200 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                      v2.4
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-100 leading-tight">
                    {greetings[currentLang].subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Language Quick Switcher */}
                <div className="flex bg-emerald-950/50 p-1 rounded-xl border border-emerald-600/40 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${currentLang === 'en' ? 'bg-white text-emerald-900 shadow-xs' : 'text-emerald-200 hover:text-white'}`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('hi')}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${currentLang === 'hi' ? 'bg-white text-emerald-900 shadow-xs' : 'text-emerald-200 hover:text-white'}`}
                  >
                    हिं
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('or')}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${currentLang === 'or' ? 'bg-white text-emerald-900 shadow-xs' : 'text-emerald-200 hover:text-white'}`}
                  >
                    ଓଡ଼ି
                  </button>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-3.5 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                  )}

                  <div className={`max-w-[84%] rounded-2xl p-3 shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                  }`}>
                    <div className="whitespace-pre-line leading-relaxed font-normal">
                      {msg.text}
                    </div>

                    <div className={`flex items-center justify-between gap-2 mt-1.5 pt-1 border-t text-[10px] ${
                      msg.sender === 'user' ? 'border-emerald-600/50 text-emerald-200' : 'border-slate-100 text-slate-400'
                    }`}>
                      <span>{msg.timestamp}</span>

                      {msg.sender === 'ai' && (
                        <button
                          onClick={() => speakMessage(msg.text, msg.id)}
                          className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                            activeSpeech === msg.id ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-emerald-700'
                          }`}
                          title="Listen with Audio"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{activeSpeech === msg.id ? (currentLang === 'hi' ? 'रोकें' : currentLang === 'or' ? 'ବନ୍ଦ' : 'Stop') : (currentLang === 'hi' ? 'सुनें' : currentLang === 'or' ? 'ଶୁଣନ୍ତୁ' : 'Listen')}</span>
                        </button>
                      )}
                    </div>

                    {/* Quick suggested prompt buttons */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {currentLang === 'hi' ? 'त्वरित प्रश्न:' : currentLang === 'or' ? 'ତ୍ୱରିତ ପ୍ରଶ୍ନ:' : 'Suggested Questions:'}
                        </span>
                        <div className="flex flex-col gap-1">
                          {msg.suggestedActions.map((prompt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(prompt)}
                              className="text-left bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/70 px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-between transition-colors cursor-pointer group"
                            >
                              <span>{prompt}</span>
                              <ChevronRight className="w-3 h-3 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 items-center text-slate-400 text-xs pl-9">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:-.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:-.4s]"></div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {currentLang === 'hi' ? 'किसान-Q सोच रहा है...' : currentLang === 'or' ? 'କିଷାନ-Q ଉତ୍ତର ଖୋଜୁଛି...' : 'Kisan-Q is thinking...'}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shadow-inner"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  currentLang === 'hi'
                    ? 'यहाँ अपना सवाल लिखें...'
                    : currentLang === 'or'
                    ? 'ଏଠାରେ ଆପଣଙ୍କ ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ...'
                    : 'Ask anything about slots, queue, or MSP...'
                }
                className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
};
