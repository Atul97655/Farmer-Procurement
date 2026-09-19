import { Language } from '../types';

export interface StepGuide {
  stepNumber: number;
  title: string;
  subtitle: string;
  badge: string;
  fieldsToFill: {
    fieldName: string;
    description: string;
    example: string;
    required: boolean;
  }[];
  tips: string[];
}

export interface DocumentItem {
  id: string;
  name: string;
  description: string;
  whereToFind: string;
  iconName: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface UserManualContent {
  manualTitle: string;
  manualSubtitle: string;
  languageLabel: string;
  printButtonText: string;
  quickChecklistTitle: string;
  quickChecklistSubtitle: string;
  stepsTabLabel: string;
  checklistTabLabel: string;
  faqTabLabel: string;
  overviewTabLabel: string;
  requiredBadge: string;
  optionalBadge: string;
  proTipLabel: string;
  whatToFillTitle: string;
  helplineTitle: string;
  helplineDesc: string;
  tollFreeNumber: string;
  registerNowBtn: string;
  continueToDashboardBtn: string;
  documents: DocumentItem[];
  steps: StepGuide[];
  faqs: FaqItem[];
}

export const USER_MANUAL_DATA: Record<Language, UserManualContent> = {
  en: {
    manualTitle: 'Farmer Quick User Manual & Registration Guide',
    manualSubtitle: 'A simple step-by-step guide on required details, documents, and slot booking for smooth crop procurement.',
    languageLabel: 'Select Language / भाषा चुनें / ଭାଷା ବାଛନ୍ତୁ',
    printButtonText: 'Print / Save PDF',
    quickChecklistTitle: '4 Things to Keep Ready Before Filling',
    quickChecklistSubtitle: 'Have these details handy to complete your registration in under 3 minutes.',
    stepsTabLabel: 'Step-by-Step Guide',
    checklistTabLabel: 'Required Documents',
    faqTabLabel: 'FAQs & Help',
    overviewTabLabel: 'Quick Overview',
    requiredBadge: 'Mandatory',
    optionalBadge: 'Optional',
    proTipLabel: 'Helpful Tip',
    whatToFillTitle: 'Information You Need to Fill in:',
    helplineTitle: 'Need Assistance on Call?',
    helplineDesc: 'Toll-free Kisan Procurement Assistance Helpline (7 AM - 9 PM):',
    tollFreeNumber: '1551 / 1800-180-1551',
    registerNowBtn: 'Go to Registration',
    continueToDashboardBtn: 'Open Farmer Dashboard',
    documents: [
      {
        id: 'doc-aadhaar',
        name: 'Aadhaar Card',
        description: 'Used for identity verification and biometric / OTP linking.',
        whereToFind: 'Keep your 12-digit Aadhaar number with mobile OTP access.',
        iconName: 'ShieldCheck'
      },
      {
        id: 'doc-land',
        name: 'Land Record (RoR / Khatian / Patta)',
        description: 'Verifies cultivated land ownership or sharecropper agreement in acres.',
        whereToFind: 'Bhulekh Odisha portal or physical copy of Record of Rights.',
        iconName: 'FileText'
      },
      {
        id: 'doc-bank',
        name: 'Bank Passbook / Cancelled Cheque',
        description: 'Aadhaar-seeded bank account for direct MSP payment transfer (DBT).',
        whereToFind: 'Passbook front page showing Bank Name, Account No, and IFSC Code.',
        iconName: 'CreditCard'
      },
      {
        id: 'doc-mobile',
        name: 'Registered Mobile Phone',
        description: 'To receive verification OTP, slot booking token SMS, and gate pass QR.',
        whereToFind: 'Any working mobile phone capable of receiving SMS.',
        iconName: 'Smartphone'
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Farmer Account & Identity Verification',
        subtitle: 'Register your mobile number and basic identification details.',
        badge: 'Step 1 of 5',
        fieldsToFill: [
          {
            fieldName: 'Full Name (as per Aadhaar)',
            description: 'Enter your legal name exactly as shown on your Aadhaar card.',
            example: 'e.g. Ramesh Chandra Nayak',
            required: true
          },
          {
            fieldName: 'Mobile Number',
            description: '10-digit mobile number for receiving OTP and Mandi updates via SMS.',
            example: 'e.g. 9876543210',
            required: true
          },
          {
            fieldName: 'District & Village / Gram Panchayat',
            description: 'Select your home district and village to assign your local cluster.',
            example: 'e.g. District: Bargarh, Village: Bhatli',
            required: true
          },
          {
            fieldName: 'Aadhaar / PM-KISAN ID',
            description: '12-digit Aadhaar number or PM-KISAN beneficiary registration ID.',
            example: 'e.g. XXXX-XXXX-4821 or OD-10293847',
            required: true
          }
        ],
        tips: [
          'Ensure the mobile number is active to instantly receive your login OTP.',
          'Your Aadhaar details are encrypted and securely verified against government registries.'
        ]
      },
      {
        stepNumber: 2,
        title: 'Land Holding & Ownership Details',
        subtitle: 'Link your agricultural land to determine your maximum procurement quota.',
        badge: 'Step 2 of 5',
        fieldsToFill: [
          {
            fieldName: 'Khatian / RoR Number',
            description: 'Record of Rights registration number as recorded in Odisha Bhulekh.',
            example: 'e.g. Khatian No. 142/89',
            required: true
          },
          {
            fieldName: 'Cultivated Land Area (in Acres)',
            description: 'Total cultivable area for the registered Kharif or Rabi crop season.',
            example: 'e.g. 4.5 Acres (or 2.0 Hectares)',
            required: true
          },
          {
            fieldName: 'Farmer Category',
            description: 'Specify whether you are an Owner Cultivator, Tenant, or Sharecropper.',
            example: 'e.g. Owner Cultivator / Small & Marginal Farmer',
            required: false
          }
        ],
        tips: [
          'Procurement limits are auto-calculated based on registered acres (typically up to 19 Qtl/acre for irrigated land).',
          'If your land details do not match Bhulekh records, contact your local Revenue Inspector (RI) or VAW.'
        ]
      },
      {
        stepNumber: 3,
        title: 'Crop Variety & Declared Quantity',
        subtitle: 'Specify the crop variety you wish to sell and estimated weight.',
        badge: 'Step 3 of 5',
        fieldsToFill: [
          {
            fieldName: 'Crop Type',
            description: 'Select the harvested commodity to be sold at government MSP.',
            example: 'e.g. Paddy (Common) - MSP ₹2,300/Qtl or Paddy (Grade A) - ₹2,320/Qtl',
            required: true
          },
          {
            fieldName: 'Crop Variety',
            description: 'Name of the certified seed or cultivar harvested.',
            example: 'e.g. Swarna (MTU 7029), Pooja, Lalat, MTU 1010',
            required: true
          },
          {
            fieldName: 'Declared Quantity (in Quintals)',
            description: 'Estimated quantity you plan to bring to the Mandi (1 Quintal = 100 Kilograms).',
            example: 'e.g. 45 Quintals (= 4,500 kg)',
            required: true
          },
          {
            fieldName: 'Harvest Date & Transport Mode',
            description: 'Date crop was cut and vehicle used (Tractor Trolley, Pickup truck, etc.).',
            example: 'e.g. Tractor Trolley (Registration OD-17-A-1234)',
            required: false
          }
        ],
        tips: [
          'Ensure grains are cleaned and sun-dried: moisture content must be below 17% for instant Mandi approval.',
          'The system will immediately show your calculated estimated MSP earnings based on declared quintals.'
        ]
      },
      {
        stepNumber: 4,
        title: 'Mandi Selection & Slot Token Booking',
        subtitle: 'Pick the least congested procurement centre and reserve your entry window.',
        badge: 'Step 4 of 5',
        fieldsToFill: [
          {
            fieldName: 'Selected Mandi / PPC Centre',
            description: 'Choose from smart recommendations sorted by distance, queue wait, and capacity.',
            example: 'e.g. Bargarh Main RMC Mandi (Lowest wait time)',
            required: true
          },
          {
            fieldName: 'Preferred Date',
            description: 'Select an available date within the next 5 days of the procurement cycle.',
            example: 'e.g. Tomorrow or Day after tomorrow',
            required: true
          },
          {
            fieldName: 'Time Slot Window',
            description: 'Select a 1-hour entry window (e.g., 08:30 - 09:30 AM or 11:30 - 12:30 PM).',
            example: 'e.g. 09:30 AM - 10:30 AM',
            required: true
          }
        ],
        tips: [
          'Green badges indicate centres with fastest queue clearance and available storage capacity.',
          'Once confirmed, your Digital Token Pass with QR Code and SMS will be generated immediately.'
        ]
      },
      {
        stepNumber: 5,
        title: 'Mandi Arrival, Digital Weighing & DBT Payment',
        subtitle: 'What happens on Mandi day: entry, quality grading, and direct bank transfer.',
        badge: 'Step 5 of 5',
        fieldsToFill: [
          {
            fieldName: 'Gate Check-in Token',
            description: 'Show your Token Number (e.g. TKN-2026-P01) or SMS QR at Gate No. 1.',
            example: 'e.g. TKN-2026-P01 shown on mobile or paper printout',
            required: true
          },
          {
            fieldName: 'Quality Inspection (Moisture & Foreign Matter)',
            description: 'Centre operator inspects crop sample for moisture (<=17%) and foreign matter (<=2%).',
            example: 'Automated AI-assisted quality assessment camera & moisture probe',
            required: true
          },
          {
            fieldName: 'Digital Weighbridge (Gross - Tare = Net)',
            description: 'Vehicle is weighed loaded, unloaded, and Net verified crop weight is locked.',
            example: 'Tamper-proof calibrated electronic weighbridge record',
            required: true
          },
          {
            fieldName: 'Direct Bank Transfer (DBT via PFMS)',
            description: 'Instant electronic J-Form generated; payment credited within 24-48 hours.',
            example: 'Direct credit to Aadhaar-linked bank account with SMS confirmation',
            required: true
          }
        ],
        tips: [
          'Arrive 15 minutes before your booked time slot to avoid token expiration.',
          'You can track your live queue position in real-time from your mobile dashboard.'
        ]
      }
    ],
    faqs: [
      {
        question: 'What if my mobile number is not registered with Aadhaar?',
        answer: 'You can still register on the KISAN-Q portal using any active 10-digit mobile phone to receive SMS tokens. However, ensure your bank account has Aadhaar enabled for DBT payments.'
      },
      {
        question: 'Can I reschedule or cancel my booked Mandi slot?',
        answer: 'Yes, you can reschedule your booked slot up to 12 hours before your scheduled time window from the "My Slot & Pass" page on your dashboard without any penalty.'
      },
      {
        question: 'How many quintals can I register per acre?',
        answer: 'As per Odisha state procurement norms, the ceiling is generally 19 Quintals per acre for irrigated land and 12 Quintals per acre for non-irrigated land for paddy.'
      },
      {
        question: 'When will the MSP procurement money be credited to my account?',
        answer: 'Once the weighment slip (J-Form) is generated, the PFMS batch is approved within 24 to 48 hours and deposited directly into your linked bank account.'
      }
    ]
  },
  hi: {
    manualTitle: 'किसान उपयोगकर्ता पुस्तिका एवं पंजीकरण मार्गदर्शिका',
    manualSubtitle: 'फसल खरीद के लिए आवश्यक विवरण, दस्तावेज और स्लॉट बुकिंग की सरल चरणबद्ध मार्गदर्शिका।',
    languageLabel: 'Select Language / भाषा चुनें / ଭାଷା ବାଛନ୍ତୁ',
    printButtonText: 'प्रिंट / पीडीएफ सहेजें',
    quickChecklistTitle: 'पंजीकरण से पहले ये 4 चीजें तैयार रखें',
    quickChecklistSubtitle: '3 मिनट में पंजीकरण पूरा करने के लिए ये दस्तावेज अपने पास रखें।',
    stepsTabLabel: 'चरणबद्ध मार्गदर्शिका',
    checklistTabLabel: 'आवश्यक दस्तावेज',
    faqTabLabel: 'अक्सर पूछे जाने वाले प्रश्न',
    overviewTabLabel: 'त्वरित सारांश',
    requiredBadge: 'अनिवार्य',
    optionalBadge: 'वैकल्पिक',
    proTipLabel: 'उपयोगी सुझाव',
    whatToFillTitle: 'आपको कौन सी जानकारी भरनी होगी:',
    helplineTitle: 'फोन पर सहायता चाहिए?',
    helplineDesc: 'टोल-फ्री किसान खरीद सहायता हेल्पलाइन (सुबह 7 से रात 9 बजे):',
    tollFreeNumber: '1551 / 1800-180-1551',
    registerNowBtn: 'पंजीकरण पृष्ठ पर जाएं',
    continueToDashboardBtn: 'किसान डैशबोर्ड खोलें',
    documents: [
      {
        id: 'doc-aadhaar',
        name: 'आधार कार्ड',
        description: 'पहचान सत्यापन और ओटीपी प्रमाणीकरण के लिए उपयोग किया जाता है।',
        whereToFind: '12 अंकों का आधार नंबर और उससे जुड़ा मोबाइल फोन पास रखें।',
        iconName: 'ShieldCheck'
      },
      {
        id: 'doc-land',
        name: 'जमीन का रिकॉर्ड (खतियान / पट्टा / RoR)',
        description: 'खेती योग्य भूमि के स्वामित्व और रकबे (एकड़) का सत्यापन।',
        whereToFind: 'भुलेख ओडिशा पोर्टल या अधिकार अभिलेख (खतियान) की प्रति।',
        iconName: 'FileText'
      },
      {
        id: 'doc-bank',
        name: 'बैंक पासबुक / रद्द चेक',
        description: 'सीधे बैंक खाते में न्यूनतम समर्थन मूल्य (DBT) भुगतान पाने के लिए।',
        whereToFind: 'पासबुक का मुख्य पृष्ठ जिसमें बैंक का नाम, खाता संख्या और IFSC कोड दर्ज हो।',
        iconName: 'CreditCard'
      },
      {
        id: 'doc-mobile',
        name: 'सक्रिय मोबाइल फोन',
        description: 'सत्यापन ओटीपी, स्लॉट टोकन नंबर और एसएमएस गेट पास प्राप्त करने हेतु।',
        whereToFind: 'कोई भी चालू मोबाइल जिस पर एसएमएस आ सके।',
        iconName: 'Smartphone'
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'किसान खाता एवं पहचान सत्यापन',
        subtitle: 'अपना मोबाइल नंबर और मूल पहचान विवरण दर्ज करें।',
        badge: 'चरण 1 / 5',
        fieldsToFill: [
          {
            fieldName: 'पूरा नाम (आधार कार्ड के अनुसार)',
            description: 'अपना नाम ठीक उसी प्रकार लिखें जैसा आधार कार्ड पर दर्ज है।',
            example: 'उदा. रमेश चंद्र नायक',
            required: true
          },
          {
            fieldName: 'मोबाइल नंबर',
            description: 'ओटीपी और मंडी सूचनाएं प्राप्त करने के लिए 10 अंकों का मोबाइल नंबर।',
            example: 'उदा. 9876543210',
            required: true
          },
          {
            fieldName: 'जिला एवं गांव / ग्राम पंचायत',
            description: 'निकटतम मंडी क्लस्टर जोड़ने के लिए अपना जिला और गांव चुनें।',
            example: 'उदा. जिला: बारगढ़, गांव: भटली',
            required: true
          },
          {
            fieldName: 'आधार संख्या / पीएम-किसान आईडी',
            description: '12 अंकों की आधार संख्या या पीएम-किसान लाभार्थी पंजीयन संख्या।',
            example: 'उदा. XXXX-XXXX-4821 या OD-10293847',
            required: true
          }
        ],
        tips: [
          'सुनिश्चित करें कि मोबाइल फोन नेटवर्क में हो ताकि लॉगिन ओटीपी तुरंत मिल सके।',
          'आपका आधार डेटा पूर्णतः सुरक्षित और सरकारी डेटाबेस से सत्यापित रहता है।'
        ]
      },
      {
        stepNumber: 2,
        title: 'कृषि भूमि एवं स्वामित्व विवरण',
        subtitle: 'अपनी खरीद सीमा (कोटा) तय करने के लिए भूमि रिकॉर्ड जोड़ें।',
        badge: 'चरण 2 / 5',
        fieldsToFill: [
          {
            fieldName: 'खतियान / RoR संख्या',
            description: 'भुलेख पोर्टल में दर्ज खतियान / खाता संख्या।',
            example: 'उदा. खतियान संख्या 142/89',
            required: true
          },
          {
            fieldName: 'कृषि भूमि रकबा (एकड़ में)',
            description: 'चालू खरीफ अथवा रबी सीजन में फसल की बुवाई वाला कुल रकबा।',
            example: 'उदा. 4.5 एकड़',
            required: true
          },
          {
            fieldName: 'किसान श्रेणी',
            description: 'स्वयं काश्तकार, बटाईदार अथवा पट्टेदार चुनें।',
            example: 'उदा. लघु एवं सीमांत किसान',
            required: false
          }
        ],
        tips: [
          'अधिकतम बिक्री कोटा पंजीकृत रकबे के अनुसार तय होता है (सिंचित भूमि पर लगभग 19 क्विंटल/एकड़)।',
          'यदि जमीन का विवरण पोर्टल पर न दिखे तो अपने स्थानीय राजस्व निरीक्षक (RI) से संपर्क करें।'
        ]
      },
      {
        stepNumber: 3,
        title: 'फसल की किस्म एवं मात्रा विवरण',
        subtitle: 'फसल की किस्म और बेचे जाने वाले अनुमानित वजन का विवरण दें।',
        badge: 'चरण 3 / 5',
        fieldsToFill: [
          {
            fieldName: 'फसल का प्रकार',
            description: 'सरकारी एमएसपी पर बेची जाने वाली फसल का चयन करें।',
            example: 'उदा. धान (सामान्य) - एमएसपी ₹2,300/क्विंटल या धान (ग्रेड ए) - ₹2,320/क्विंटल',
            required: true
          },
          {
            fieldName: 'फसल की किस्म (वैरायटी)',
            description: 'कटाई की गई धान/फसल की वैरायटी का नाम लिखें।',
            example: 'उदा. स्वर्णा (MTU 7029), पूजा, ललाट, एमटीयू 1010',
            required: true
          },
          {
            fieldName: 'अनुमानित मात्रा (क्विंटल में)',
            description: 'मंडी में लाई जाने वाली संभावित मात्रा (1 क्विंटल = 100 किलोग्राम)।',
            example: 'उदा. 45 क्विंटल (= 4,500 किलोग्राम)',
            required: true
          },
          {
            fieldName: 'कटाई तिथि एवं वाहन का प्रकार',
            description: 'फसल कटाई की तिथि एवं परिवहन साधन (ट्रैक्टर ट्रॉली, पिकअप आदि)।',
            example: 'उदा. ट्रैक्टर ट्रॉली (गाड़ी संख्या OD-17-A-1234)',
            required: false
          }
        ],
        tips: [
          'अनाज साफ और सूखा होना चाहिए: नमी की मात्रा 17% से कम होनी अनिवार्य है।',
          'मात्रा दर्ज करते ही सिस्टम आपको अनुमानित कुल एमएसपी आय तुरंत दिखाएगा।'
        ]
      },
      {
        stepNumber: 4,
        title: 'मंडी का चयन एवं समय स्लॉट बुकिंग',
        subtitle: 'कम भीड़ वाली मंडी चुनें और अपनी सुविधा अनुसार समय आरक्षित करें।',
        badge: 'चरण 4 / 5',
        fieldsToFill: [
          {
            fieldName: 'खरीद केंद्र (मंडी) का चयन',
            description: 'दूरी और कम प्रतीक्षा समय के आधार पर सुझाई गई मंडी चुनें।',
            example: 'उदा. बारगढ़ मुख्य आरएमसी मंडी (सबसे कम प्रतीक्षा समय)',
            required: true
          },
          {
            fieldName: 'पसंदीदा दिनांक',
            description: 'आगामी 5 दिनों में से अपनी पसंद का दिन चुनें।',
            example: 'उदा. कल या परसों',
            required: true
          },
          {
            fieldName: 'समय स्लॉट (1 घंटा विंडो)',
            description: 'मंडी में प्रवेश का 1 घंटे का समय चुनें (उदा. 08:30 - 09:30 पूर्वाह्न)।',
            example: 'उदा. 09:30 - 10:30 पूर्वाह्न',
            required: true
          }
        ],
        tips: [
          'हरे रंग का बैज सबसे कम भीड़ और तेज़ तौल वाले केंद्रों को दर्शाता है।',
          'पुष्टि करते ही आपका डिजिटल टोकन पास और एसएमएस तुरंत तैयार हो जाएगा।'
        ]
      },
      {
        stepNumber: 5,
        title: 'मंडी आगमन, इलेक्ट्रॉनिक तौल एवं डीबीटी भुगतान',
        subtitle: 'मंडी वाले दिन: प्रवेश, गुणवत्ता जांच, वजन और खाते में भुगतान।',
        badge: 'चरण 5 / 5',
        fieldsToFill: [
          {
            fieldName: 'गेट एंट्री टोकन',
            description: 'गेट नंबर 1 पर अपना टोकन नंबर (उदा. TKN-2026-P01) या एसएमएस दिखाएं।',
            example: 'मोबाइल स्क्रीन या प्रिंटेड टोकन पर्ची',
            required: true
          },
          {
            fieldName: 'गुणवत्ता जांच (नमी एवं बाहरी पदार्थ)',
            description: 'मंडी अधिकारी द्वारा नमी (<=17%) और कचरा (<=2%) की डिजिटल जांच।',
            example: 'एआई कैमरा एवं ऑटोमेटेड मॉइश्चर मीटर द्वारा त्वरित जांच',
            required: true
          },
          {
            fieldName: 'इलेक्ट्रॉनिक धर्मकांटा तौल (कुल वजन - खाली वाहन)',
            description: 'भरी गाड़ी और खाली गाड़ी का सटीक कंप्यूटर तौल किया जाता है।',
            example: 'कंप्यूटरीकृत डिजिटल वे-ब्रिज रसीद',
            required: true
          },
          {
            fieldName: 'डीबीटी बैंक अंतरण (PFMS के माध्यम से)',
            description: 'ई-खरीद रसीद (J-Form) जारी होती है और 24-48 घंटे में पैसा बैंक में जमा।',
            example: 'आधार लिंक्ड बैंक खाते में सीधे पैसा और एसएमएस अलर्ट',
            required: true
          }
        ],
        tips: [
          'अपने निर्धारित समय से 15 मिनट पहले पहुंचें ताकि टोकन निरस्त न हो।',
          'आप मोबाइल ऐप से लाइव कतार में अपना नंबर किसी भी समय देख सकते हैं।'
        ]
      }
    ],
    faqs: [
      {
        question: 'यदि मेरा मोबाइल नंबर आधार से लिंक नहीं है तो क्या करें?',
        answer: 'आप किसी भी 10 अंकों के चालू मोबाइल से किसान पोर्टल पर पंजीकरण कर सकते हैं। लेकिन यह सुनिश्चित करें कि आपका बैंक खाता आधार से जुड़ा हो ताकि डीबीटी भुगतान मिल सके।'
      },
      {
        question: 'क्या मैं अपनी बुक की हुई स्लॉट तिथि बदल सकता हूँ?',
        answer: 'हाँ, आप निर्धारित समय से 12 घंटे पहले डैशबोर्ड के "मेरा स्लॉट व पास" खंड से बिना किसी शुल्क के अपनी तिथि बदल सकते हैं।'
      },
      {
        question: 'प्रति एकड़ अधिकतम कितना धान बेचा जा सकता है?',
        answer: 'ओडिशा सरकार के नियमों के अनुसार सिंचित भूमि के लिए सामान्यतः 19 क्विंटल प्रति एकड़ तथा गैर-सिंचित भूमि के लिए 12 क्विंटल प्रति एकड़ की सीमा निर्धारित है।'
      },
      {
        question: 'बिक्री का पैसा बैंक खाते में कब आएगा?',
        answer: 'मंडी में डिजिटल तौल पर्ची (J-Form) बनने के 24 से 48 घंटे के भीतर पीएफएमएस के माध्यम से राशि सीधे आपके बैंक खाते में जमा हो जाती है।'
      }
    ]
  },
  or: {
    manualTitle: 'କୃଷକ ବ୍ୟବହାରକାରୀ ନିର୍ଦ୍ଦେଶିକା ଓ ପଞ୍ଜୀକରଣ ମାର୍ଗଦର୍ଶିକା',
    manualSubtitle: 'ଫସଲ ବିକ୍ରୟ ପାଇଁ ଆବଶ୍ୟକ ତଥ୍ୟ, କାଗଜପତ୍ର ଏବଂ ମଣ୍ଡି ସ୍ଲଟ୍ ବୁକିଂର ସରଳ ପଦ୍ଧତି।',
    languageLabel: 'Select Language / भाषा चुनें / ଭାଷା ବାଛନ୍ତୁ',
    printButtonText: 'ପ୍ରିଣ୍ଟ କରନ୍ତୁ / ପିଡିଏଫ୍ ସାଇତନ୍ତୁ',
    quickChecklistTitle: 'ଫର୍ମ ପୂରଣ କରିବା ପୂର୍ବରୁ ଏହି ୪ଟି ଜିନିଷ ପ୍ରସ୍ତୁତ ରଖନ୍ତୁ',
    quickChecklistSubtitle: '୩ ମିନିଟରେ ପଞ୍ଜୀକରଣ ସାରିବା ପାଇଁ ଏହି ତଥ୍ୟଗୁଡ଼ିକ ପାଖରେ ରଖନ୍ତୁ।',
    stepsTabLabel: 'ପର୍ଯ୍ୟାୟକ୍ରମିକ ମାର୍ଗଦର୍ଶିକା',
    checklistTabLabel: 'ଆବଶ୍ୟକୀୟ କାଗଜପତ୍ର',
    faqTabLabel: 'ବାରମ୍ବାର ପଚରାଯାଉଥିବା ପ୍ରଶ୍ନ (FAQs)',
    overviewTabLabel: 'ସଂକ୍ଷିପ୍ତ ସାରାଂଶ',
    requiredBadge: 'ବାଧ୍ୟତାମୂଳକ',
    optionalBadge: 'ଐଚ୍ଛିକ',
    proTipLabel: 'ଜରୁରୀ ପରାମର୍ଶ',
    whatToFillTitle: 'ଆପଣଙ୍କୁ କେଉଁ କେଉଁ ତଥ୍ୟ ପୂରଣ କରିବାକୁ ପଡ଼ିବ:',
    helplineTitle: 'ଫୋନରେ ସାହାଯ୍ୟ ଦରକାର କି?',
    helplineDesc: 'ଟୋଲ୍-ଫ୍ରି କୃଷକ କ୍ରୟ ସହାୟତା ହେଲ୍ପଲାଇନ୍ (ସକାଳ ୭ ରୁ ରାତି ୯):',
    tollFreeNumber: '1551 / 1800-180-1551',
    registerNowBtn: 'ପଞ୍ଜୀକରଣ ପୃଷ୍ଠାକୁ ଯାଆନ୍ତୁ',
    continueToDashboardBtn: 'କୃଷକ ଡ୍ୟାସବୋର୍ଡ ଖୋଲନ୍ତୁ',
    documents: [
      {
        id: 'doc-aadhaar',
        name: 'ଆଧାର କାର୍ଡ (Aadhaar Card)',
        description: 'ପରିଚୟ ଯାଞ୍ଚ ଏବଂ ମୋବାଇଲ୍ ଓଟିପି ପ୍ରମାଣୀକରଣ ପାଇଁ ଆବଶ୍ୟକ।',
        whereToFind: '୧୨-ଅଙ୍କ ବିଶିଷ୍ଟ ଆଧାର ନମ୍ବର ଏବଂ ସଂଯୁକ୍ତ ମୋବାଇଲ୍ ପାଖରେ ରଖନ୍ତୁ।',
        iconName: 'ShieldCheck'
      },
      {
        id: 'doc-land',
        name: 'ଜମି ପଟ୍ଟା / ଖତିୟାନ (RoR)',
        description: 'ଚାଷଜମିର ମାଲିକାନା ଏବଂ ଏକର ହିସାବରେ ପଞ୍ଜୀକୃତ ଜମି ଯାଞ୍ଚ।',
        whereToFind: 'ଭୂଲେଖ ଓଡ଼ିଶା ପୋର୍ଟାଲ୍ କିମ୍ବା ପଟ୍ଟା / ଖତିୟାନର ନକଲ।',
        iconName: 'FileText'
      },
      {
        id: 'doc-bank',
        name: 'ବ୍ୟାଙ୍କ ପାସବୁକ୍ / ବାତିଲ୍ ଚେକ୍',
        description: 'ସିଧାସଳଖ ବ୍ୟାଙ୍କ ଖାତାରେ ଏମଏସପି (DBT) ଟଙ୍କା ପାଇବା ପାଇଁ।',
        whereToFind: 'ପାସବୁକର ପ୍ରଥମ ପୃଷ୍ଠା ଯେଉଁଥିରେ ବ୍ୟାଙ୍କ ନାମ, ଖାତା ନଂ ଓ IFSC କୋଡ୍ ଥାଏ।',
        iconName: 'CreditCard'
      },
      {
        id: 'doc-mobile',
        name: 'ଚାଲୁ ଥିବା ମୋବାଇଲ୍ ଫୋନ୍',
        description: 'ଓଟିପି, ଟୋକନ୍ ସଂଖ୍ୟା ଏବଂ ମଣ୍ଡି ପ୍ରବେଶ ଏସଏମଏସ ପାଇବା ପାଇଁ।',
        whereToFind: 'ଏସଏମଏସ ଆସିପାରୁଥିବା ଯେକୌଣସି ସକ୍ରିୟ ମୋବାଇଲ୍ ନମ୍ବର।',
        iconName: 'Smartphone'
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'କୃଷକ ଖାତା ଓ ପରିଚୟ ପ୍ରମାଣୀକରଣ',
        subtitle: 'ଆପଣଙ୍କ ମୋବାଇଲ୍ ନମ୍ବର ଏବଂ ମୌଳିକ ପରିଚୟ ବିବରଣୀ ପ୍ରବେଶ କରନ୍ତୁ।',
        badge: 'ପର୍ଯ୍ୟାୟ ୧ / ୫',
        fieldsToFill: [
          {
            fieldName: 'ସମ୍ପୂର୍ଣ୍ଣ ନାମ (ଆଧାର ଅନୁଯାୟୀ)',
            description: 'ଆଧାର କାର୍ଡରେ ଯେପରି ଲେଖାଅଛି ଠିକ୍ ସେହିପରି ନାମ ଲେଖନ୍ତୁ।',
            example: 'ଯଥା: ରମେଶ ଚନ୍ଦ୍ର ନାୟକ',
            required: true
          },
          {
            fieldName: 'ମୋବାଇଲ୍ ନମ୍ବର',
            description: 'ଓଟିପି ଓ ମଣ୍ଡି ସୂଚନା ପାଇବା ପାଇଁ ୧୦-ଅଙ୍କ ବିଶିଷ୍ଟ ମୋବାଇଲ୍ ନମ୍ବର।',
            example: 'ଯଥା: 9876543210',
            required: true
          },
          {
            fieldName: 'ଜିଲ୍ଲା ଏବଂ ଗ୍ରାମ / ପଞ୍ଚାୟତ',
            description: 'ନିକଟସ୍ଥ ମଣ୍ଡି ଚୟନ ପାଇଁ ଆପଣଙ୍କ ଜିଲ୍ଲା ଓ ଗାଁ ବାଛନ୍ତୁ।',
            example: 'ଯଥା: ଜିଲ୍ଲା: ବରଗଡ଼, ଗ୍ରାମ: ଭଟଲି',
            required: true
          },
          {
            fieldName: 'ଆଧାର ନମ୍ବର / ପିଏମ୍-କିଷାନ ଆଇଡି',
            description: '୧୨-ଅଙ୍କ ବିଶିଷ୍ଟ ଆଧାର ନମ୍ବର କିମ୍ବା କୃଷକ ପଞ୍ଜୀକରଣ ନମ୍ବର।',
            example: 'ଯଥା: XXXX-XXXX-4821 କିମ୍ବା OD-10293847',
            required: true
          }
        ],
        tips: [
          'ମୋବାଇଲରେ ନେଟୱର୍କ ଥିବା ନିଶ୍ଚିତ କରନ୍ତୁ ଯାହାଦ୍ୱାରା ଲଗଇନ୍ ଓଟିପି ତୁରନ୍ତ ମିଳିପାରିବ।',
          'ଆପଣଙ୍କ ଆଧାର ତଥ୍ୟ ସମ୍ପୂର୍ଣ୍ଣ ସୁରକ୍ଷିତ ଏବଂ ସରକାରୀ ଡାଟାବେସ୍ ସହ ଯାଞ୍ଚ ହୋଇଥାଏ।'
        ]
      },
      {
        stepNumber: 2,
        title: 'ଚାଷଜମି ଏବଂ ମାଲିକାନା ବିବରଣୀ',
        subtitle: 'ବିକ୍ରୟ କୋଟା ନିର୍ଦ୍ଧାରଣ କରିବା ପାଇଁ ଜମି ରେକର୍ଡ ସଂଯୋଗ କରନ୍ତୁ।',
        badge: 'ପର୍ଯ୍ୟାୟ ୨ / ୫',
        fieldsToFill: [
          {
            fieldName: 'ଖତିୟାନ / RoR ନମ୍ବର',
            description: 'ଓଡ଼ିଶା ଭୂଲେଖ ପୋର୍ଟାଲରେ ପଞ୍ଜୀକୃତ ଖତିୟାନ ନମ୍ବର।',
            example: 'ଯଥା: ଖତିୟାନ ନଂ 142/89',
            required: true
          },
          {
            fieldName: 'ଚାଷଜମି ପରିମାଣ (ଏକରରେ)',
            description: 'ଚଳିତ ଖରିଫ୍ କିମ୍ବା ରବି ଋତୁରେ ଫସଲ ଚାଷ ହୋଇଥିବା ମୋଟ ଜମି।',
            example: 'ଯଥା: 4.5 ଏକର',
            required: true
          },
          {
            fieldName: 'କୃଷକ ବର୍ଗ',
            description: 'ନିଜସ୍ୱ ଚାଷୀ, ଭାଗଚାଷୀ କିମ୍ବା କ୍ଷୁଦ୍ର ଓ ନାମମାତ୍ର ଚାଷୀ।',
            example: 'ଯଥା: କ୍ଷୁଦ୍ର ଓ ନାମମାତ୍ର ଚାଷୀ',
            required: false
          }
        ],
        tips: [
          'ପଞ୍ଜୀକୃତ ଏକର ଅନୁସାରେ ସର୍ବାଧିକ ଧାନ କ୍ରୟ ସୀମା ନିର୍ଦ୍ଧାରିତ ହୁଏ (ଜଳସେଚିତ ଜମି ପାଇଁ ପ୍ରାୟ ୧୯ କ୍ୱିଣ୍ଟାଲ୍/ଏକର)।',
          'ଯଦି ଜମି ତଥ୍ୟ ମେଳ ନ ଖାଏ, ତେବେ ସ୍ଥାନୀୟ ରାଜସ୍ୱ ନିରୀକ୍ଷକ (RI)ଙ୍କ ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ।'
        ]
      },
      {
        stepNumber: 3,
        title: 'ଫସଲ କିସମ ଏବଂ ପରିମାଣ ବିବରଣୀ',
        subtitle: 'ଆପଣ ବିକ୍ରୟ କରିବାକୁ ଚାହୁଁଥିବା ଫସଲର କିସମ ଓ ଓଜନ ଉଲ୍ଲେଖ କରନ୍ତୁ।',
        badge: 'ପର୍ଯ୍ୟାୟ ୩ / ୫',
        fieldsToFill: [
          {
            fieldName: 'ଫସଲ ପ୍ରକାର',
            description: 'ସରକାରୀ ସର୍ବନିମ୍ନ ସହାୟକ ମୂଲ୍ୟ (MSP)ରେ ବିକ୍ରି ପାଇଁ ଫସଲ ବାଛନ୍ତୁ।',
            example: 'ଯଥା: ଧାନ (ସାଧାରଣ) - ₹୨,୩୦୦/କ୍ୱିଣ୍ଟାଲ୍ କିମ୍ବା ଧାନ (ଗ୍ରେଡ୍ ଏ) - ₹୨,୩୨୦/କ୍ୱିଣ୍ଟାଲ୍',
            required: true
          },
          {
            fieldName: 'ଫସଲ କିସମ (Variety)',
            description: 'ଅମଳ ହୋଇଥିବା ବିହନ ବା ଧାନର କିସମ ନାମ।',
            example: 'ଯଥା: ସ୍ୱର୍ଣ୍ଣା (MTU 7029), ପୂଜା, ଲଲାଟ, ଏମଟିୟୁ 1010',
            required: true
          },
          {
            fieldName: 'ଆନୁମାନିକ ପରିମାଣ (କ୍ୱିଣ୍ଟାଲରେ)',
            description: 'ମଣ୍ଡିକୁ ନେବାକୁ ଥିବା ସମ୍ଭାବ୍ୟ ପରିମାଣ (୧ କ୍ୱିଣ୍ଟାଲ୍ = ୧୦୦ କିଲୋଗ୍ରାମ)।',
            example: 'ଯଥା: 45 କ୍ୱିଣ୍ଟାଲ୍ (= ୪,୫୦୦ କିଲୋଗ୍ରାମ)',
            required: true
          },
          {
            fieldName: 'ଅମଳ ତାରିଖ ଓ ଗାଡ଼ିର ପ୍ରକାର',
            description: 'ଫସଲ ଅମଳ ତାରିଖ ଏବଂ ପରିବହନ ଗାଡ଼ି (ଟ୍ରାକ୍ଟର ଟ୍ରଲି, ପିକ୍ଅପ୍ ଇତ୍ୟାଦି)।',
            example: 'ଯଥା: ଟ୍ରାକ୍ଟର ଟ୍ରଲି (ଗାଡ଼ି ନଂ OD-17-A-1234)',
            required: false
          }
        ],
        tips: [
          'ଧାନ ସଫା ଏବଂ ଶୁଖିଲା ହୋଇଥିବା ଆବଶ୍ୟକ: ଆର୍ଦ୍ରତା (Moisture) ୧୭% ରୁ କମ୍ ରହିବା ବାଧ୍ୟତାମୂଳକ।',
          'ପରିମାଣ ଲେଖିବା ମାତ୍ରେ ସିଷ୍ଟମ୍ ଆପଣଙ୍କ ମୋଟ ଏମଏସପି ପ୍ରାପ୍ୟ ଟଙ୍କା ତୁରନ୍ତ ଦେଖାଇବ।'
        ]
      },
      {
        stepNumber: 4,
        title: 'ମଣ୍ଡି ଚୟନ ଏବଂ ସମୟ ସ୍ଲଟ୍ ବୁକିଂ',
        subtitle: 'କମ୍ ଭିଡ଼ ଥିବା ମଣ୍ଡି ବାଛନ୍ତୁ ଏବଂ ନିଜ ସୁବିଧା ଅନୁସାରେ ସମୟ ସଂରକ୍ଷଣ କରନ୍ତୁ।',
        badge: 'ପର୍ଯ୍ୟାୟ ୪ / ୫',
        fieldsToFill: [
          {
            fieldName: 'ମଣ୍ଡି / କ୍ରୟ କେନ୍ଦ୍ର ଚୟନ',
            description: 'ଦୂରତା ଓ କମ୍ ଅପେକ୍ଷା ସମୟ ଆଧାରରେ ସ୍ମାର୍ଟ ସୁପାରିଶ ମଣ୍ଡି ଚୟନ କରନ୍ତୁ।',
            example: 'ଯଥା: ବରଗଡ଼ ମୁଖ୍ୟ ଆରଏମସି ମଣ୍ଡି (ସବୁଠାରୁ କମ୍ ଅପେକ୍ଷା ସମୟ)',
            required: true
          },
          {
            fieldName: 'ପସନ୍ଦର ତାରିଖ',
            description: 'ଆଗାମୀ ୫ ଦିନ ମଧ୍ୟରୁ ଯେକୌଣସି ଉପଲବ୍ଧ ଦିନ ବାଛନ୍ତୁ।',
            example: 'ଯଥା: ଆସନ୍ତାକାଲି କିମ୍ବା ପଅରଦିନ',
            required: true
          },
          {
            fieldName: 'ସମୟ ସ୍ଲଟ୍ (୧ ଘଣ୍ଟା ୱିଣ୍ଡୋ)',
            description: 'ମଣ୍ଡିରେ ପ୍ରବେଶ ପାଇଁ ୧ ଘଣ୍ଟାର ଉପଲବ୍ଧ ସମୟ ସ୍ଲଟ୍ ବାଛନ୍ତୁ।',
            example: 'ଯଥା: ସକାଳ 09:30 - 10:30 AM',
            required: true
          }
        ],
        tips: [
          'ସବୁଜ ରଙ୍ଗର ବ୍ୟାଜ୍ ସବୁଠାରୁ ଶୀଘ୍ର ତୌଲ ଓ କମ୍ ଲାଇନ୍ ଥିବା କେନ୍ଦ୍ରକୁ ଦର୍ଶାଏ।',
          'ବୁକିଂ ସରିବା ମାତ୍ରେ କ୍ୟୁଆର୍ କୋଡ୍ ସହ ଡିଜିଟାଲ୍ ଟୋକନ୍ ପାସ୍ ଏବଂ ଏସଏମଏସ ମିଳିଯିବ।'
        ]
      },
      {
        stepNumber: 5,
        title: 'ମଣ୍ଡି ଆଗମନ, ଡିଜିଟାଲ୍ ଓଜନ ଓ ବ୍ୟାଙ୍କ ଖାତାରେ ଟଙ୍କା',
        subtitle: 'ମଣ୍ଡି ଦିନ: ଗେଟ୍ ପ୍ରବେଶ, ଗୁଣବତ୍ତା ଯାଞ୍ଚ, ଓଜନ ଓ ସିଧାସଳଖ ଡିବିଟି ପେମେଣ୍ଟ।',
        badge: 'ପର୍ଯ୍ୟାୟ ୫ / ୫',
        fieldsToFill: [
          {
            fieldName: 'ଗେଟ୍ ପ୍ରବେଶ ଟୋକନ୍',
            description: 'ଗେଟ୍ ନଂ ୧ ରେ ଆପଣଙ୍କ ଟୋକନ୍ ନମ୍ବର (ଯଥା: TKN-2026-P01) କିମ୍ବା ଏସଏମଏସ ଦେଖାନ୍ତୁ।',
            example: 'ମୋବାଇଲ୍ ସ୍କ୍ରିନ୍ କିମ୍ବା ଛପା ଟୋକନ୍ ପାସ୍',
            required: true
          },
          {
            fieldName: 'ଗୁଣବତ୍ତା ଯାଞ୍ଚ (ଆର୍ଦ୍ରତା ଓ ଅପଦ୍ରବ୍ୟ)',
            description: 'ମଣ୍ଡି ଅଧିକାରୀଙ୍କ ଦ୍ୱାରା ଧାନର ଆର୍ଦ୍ରତା (<=୧୭%) ଏବଂ ଧୂଳିକଣା (<=୨%) ଯାଞ୍ଚ।',
            example: 'ଏଆଇ କ୍ୟାମେରା ଓ ଡିଜିଟାଲ୍ ଆର୍ଦ୍ରତା ମିଟର ଯାଞ୍ଚ',
            required: true
          },
          {
            fieldName: 'ଇଲେକ୍ଟ୍ରୋନିକ୍ ଧର୍ମକଣ୍ଟା ଓଜନ (ଭାରି ଗାଡ଼ି - ଖାଲି ଗାଡ଼ି)',
            description: 'ଗାଡ଼ିର ସଠିକ୍ ଓ ଅପରିବର୍ତ୍ତନୀୟ କମ୍ପ୍ୟୁଟରାଇଜ୍ଡ ଓଜନ ରେକର୍ଡ।',
            example: 'ଡିଜିଟାଲ୍ ୱେ-ବ୍ରିଜ୍ ରସିଦ',
            required: true
          },
          {
            fieldName: 'ଡିବିଟି ବ୍ୟାଙ୍କ ଜମା (PFMS ଜରିଆରେ)',
            description: 'ଇ-କ୍ରୟ ରସିଦ (J-Form) ମିଳିବ ଏବଂ ୨୪-୪୮ ଘଣ୍ଟା ମଧ୍ୟରେ ବ୍ୟାଙ୍କ ଖାତାରେ ଟଙ୍କା ଜମା।',
            example: 'ଆଧାର ସଂଯୁକ୍ତ ବ୍ୟାଙ୍କ ଖାତାକୁ ସିଧାସଳଖ ଜମା ଓ ଏସଏମଏସ ବାର୍ତ୍ତା',
            required: true
          }
        ],
        tips: [
          'ଆପଣଙ୍କ ବୁକ୍ ହୋଇଥିବା ସମୟର ୧୫ ମିନିଟ୍ ପୂର୍ବରୁ ପହଞ୍ଚନ୍ତୁ ଯାହାଦ୍ୱାରା ଟୋକନ୍ ବାତିଲ୍ ହେବ ନାହିଁ।',
          'ଆପଣ ମୋବାଇଲ୍ ଆପ୍ ମାଧ୍ୟମରେ ଲାଇଭ୍ କ୍ୟୁରେ ନିଜ ନମ୍ବର ଯେକୌଣସି ସମୟରେ ଦେଖିପାରିବେ।'
        ]
      }
    ],
    faqs: [
      {
        question: 'ଯଦି ମୋବାଇଲ୍ ନମ୍ବର ଆଧାର ସହିତ ସଂଯୋଗ ହୋଇନାହିଁ ତେବେ କଣ କରିବି?',
        answer: 'ଆପଣ ଯେକୌଣସି ଚାଲୁ ଥିବା ୧୦-ଅଙ୍କ ମୋବାଇଲ୍ ନମ୍ବର ଦ୍ୱାରା ପୋର୍ଟାଲରେ ପଞ୍ଜୀକରଣ କରିପାରିବେ। କିନ୍ତୁ ଡିବିଟି ପେମେଣ୍ଟ ପାଇଁ ବ୍ୟାଙ୍କ ଖାତା ସହ ଆଧାର ଲିଙ୍କ ଥିବା ଆବଶ୍ୟକ।'
      },
      {
        question: 'ମୁଁ ବୁକ୍ କରିଥିବା ସ୍ଲଟ୍ ତାରିଖ ପରିବର୍ତ୍ତନ କରିପାରିବି କି?',
        answer: 'ହଁ, ଆପଣ ନିର୍ଦ୍ଧାରିତ ସମୟର ୧୨ ଘଣ୍ଟା ପୂର୍ବରୁ ଡ୍ୟାସବୋର୍ଡର "ମୋ ସ୍ଲଟ୍ ଓ ପାସ୍" ବିଭାଗରୁ ବିନା କୌଣସି ଫିରେ ନୂଆ ତାରିଖ ବାଛିପାରିବେ।'
      },
      {
        question: 'ଏକର ପିଛା ସର୍ବାଧିକ କେତେ କ୍ୱିଣ୍ଟାଲ୍ ଧାନ ବିକ୍ରି କରିହେବ?',
        answer: 'ଓଡ଼ିଶା ସରକାରଙ୍କ ନିୟମ ଅନୁସାରେ ଜଳସେଚିତ ଜମି ପାଇଁ ଏକର ପିଛା ସର୍ବାଧିକ ୧୯ କ୍ୱିଣ୍ଟାଲ୍ ଏବଂ ଅଣ-ଜଳସେଚିତ ଜମି ପାଇଁ ୧୨ କ୍ୱିଣ୍ଟାଲ୍ ସୀମା ରହିଛି।'
      },
      {
        question: 'ବିକ୍ରି ଟଙ୍କା କେବେ ବ୍ୟାଙ୍କ ଖାତାକୁ ଆସିବ?',
        answer: 'ମଣ୍ଡିରେ ଡିଜିଟାଲ୍ ଓଜନ ପରେ J-Form ବାହାରିବାର ୨୪ ରୁ ୪୮ ଘଣ୍ଟା ମଧ୍ୟରେ PFMS ମାଧ୍ୟମରେ ସିଧାସଳଖ ଆପଣଙ୍କ ବ୍ୟାଙ୍କ ଖାତାରେ ଟଙ୍କା ଜମା ହୋଇଯାଏ।'
      }
    ]
  }
};
