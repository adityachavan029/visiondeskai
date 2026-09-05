export const translations = {
  en: {
    // Brand & Navigation
    brandName: "VISIONDESK.AI",
    landing: "Landing",
    workstation: "Workstation",
    studioActive: "STUDIO WORKSTATION ACTIVE",
    signIn: "Sign In",
    login: "Login",
    logout: "Log Out",
    apiOnline: "API Online",
    connecting: "Connecting...",
    menu: "Menu",
    language: "Language",
    english: "English",
    hindi: "हिन्दी",
    theme: "Theme",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    
    // Workstation Modules
    visionInspector: "Vision Inspector",
    knowledgeHub: "Knowledge Hub",
    aiInvestigation: "AI Investigation",
    safetyDashboard: "Safety Dashboard",

    // Landing Page
    heroBadge: "NEXT-GEN WORKPLACE SAFETY INTELLIGENCE",
    heroTitle1: "AI-Powered Computer Vision &",
    heroTitle2: "Automated Risk Telemetry",
    heroDesc: "Real-time PPE compliance tracking, multimodal incident investigation, and standard safety protocol analysis built for modern industrial operations.",
    launchWorkstation: "Launch Workstation Studio",
    exploreDocs: "Explore Knowledge Hub",
    safetyScore: "Safety Score",
    activeCameras: "Active Cameras",
    incidentResolution: "Incident Resolution",
    quickAccess: "Quick Access Modules",

    // General Controls
    close: "Close",
    selectLanguage: "Select Language / भाषा चुनें",
  },
  hi: {
    // Brand & Navigation
    brandName: "विजनडेस्क.AI",
    landing: "लैंडिंग",
    workstation: "वर्कस्टेशन",
    studioActive: "स्टुडियो वर्कस्टेशन सक्रिय",
    signIn: "साइन इन करें",
    login: "लॉगिन",
    logout: "लॉग आउट",
    apiOnline: "एपीआई ऑनलाइन",
    connecting: "कनेक्ट हो रहा है...",
    menu: "मेनू",
    language: "भाषा",
    english: "English",
    hindi: "हिन्दी",
    theme: "थीम",
    lightMode: "लाइट मोड",
    darkMode: "डार्क मोड",
    
    // Workstation Modules
    visionInspector: "विज़न निरीक्षक",
    knowledgeHub: "ज्ञान केंद्र",
    aiInvestigation: "एआई जांच",
    safetyDashboard: "सुरक्षा डैशबोर्ड",

    // Landing Page
    heroBadge: "अगली पीढ़ी कार्यस्थल सुरक्षा इंटेलिजेंस",
    heroTitle1: "एआई-संचालित कंप्यूटर विज़न एवं",
    heroTitle2: "स्वचालित जोखिम टेलीमेट्री",
    heroDesc: "आधुनिक औद्योगिक संचालन के लिए निर्मित वास्तविक समय पीपीई अनुपालन ट्रैकिंग, बहु-मोड घटना जांच और मानक सुरक्षा प्रोटोकॉल विश्लेषण।",
    launchWorkstation: "वर्कस्टेशन स्टूडियो शुरू करें",
    exploreDocs: "ज्ञान केंद्र देखें",
    safetyScore: "सुरक्षा स्कोर",
    activeCameras: "सक्रिय कैमरे",
    incidentResolution: "घटना समाधान",
    quickAccess: "त्वरित पहुंच मॉड्यूल",

    // General Controls
    close: "बंद करें",
    selectLanguage: "भाषा चुनें / Select Language",
  }
};

export const getTranslation = (lang, key) => {
  return translations[lang]?.[key] || translations['en'][key] || key;
};
