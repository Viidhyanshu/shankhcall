export type SupportedLanguages = 'en' | 'hi';

export interface TranslationDictionary {
  report: string;
  eventType: string;
  source: string;
  filters: string;
  from: string;
  to: string;
  location: string;
  apply: string;
  reset: string;
  hotspots: string;
  about: string;
  unifiedFeed: string;
  socialMonitor: string;
  newReport: string;
  description: string;
  when: string;
  language: string;
  locationLabel: string;
  media: string;
  consent: string;
  cancel: string;
  submit: string;
  close: string;
  tagline: string;
  roleCitizen: string;
  roleOfficial: string;
  roleAnalyst: string;
  all: string;
  legendDensity: string;
  legendSpikes: string;
  legendVerified: string;
  hotspotsNote: string;
  aboutText: string;
  loadSample: string;
  analyze: string;
  searchPlaceholder: string;
  pastePostsPlaceholder: string;
  descPlaceholder: string;
  noItems: string;
  geolocationUnsupported: string;
  geolocationDenied: string;
  provideLocation: string;
  pasteSomePosts: string;
  successSync: string;
  trendChartTitle: string;
  sentimentChartTitle: string;
}

export const I18N: Record<SupportedLanguages, TranslationDictionary> = {
  en: {
    report: 'Report Hazard',
    eventType: 'Event Type',
    source: 'Source',
    filters: 'Filters',
    from: 'From',
    to: 'To',
    location: 'Location',
    apply: 'Apply',
    reset: 'Reset',
    hotspots: 'Hotspots',
    about: 'About',
    unifiedFeed: 'Unified Feed',
    socialMonitor: 'Social Monitor',
    newReport: 'New Disaster Report',
    description: 'Description',
    when: 'When',
    language: 'Language',
    locationLabel: 'Location',
    media: 'Media (images/videos)',
    consent: 'Consent',
    cancel: 'Cancel',
    submit: 'Submit',
    close: 'Close',
    tagline: 'Unified citizen + social hazard intelligence',
    roleCitizen: 'Citizen',
    roleOfficial: 'Official',
    roleAnalyst: 'Analyst',
    all: 'All',
    legendDensity: 'Reports density',
    legendSpikes: 'Keyword spikes',
    legendVerified: 'Verified incidents',
    hotspotsNote: 'Heat layer shows density; clusters show localized hotspots. Toggle in map controls.',
    aboutText: 'A project that provides a unified platform for citizens, volunteers, and disaster managers to report hazards and monitor social trends in real time.',
    loadSample: 'Load Sample Social Posts',
    analyze: 'Analyze',
    searchPlaceholder: 'e.g., Chennai, Assam, Visakhapatnam',
    pastePostsPlaceholder: 'Paste recent social posts, one per line.',
    descPlaceholder: 'What did you observe?',
    noItems: 'No items match filters.',
    geolocationUnsupported: 'Geolocation not supported',
    geolocationDenied: 'Geolocation access not approved:',
    provideLocation: 'Please provide a valid location (use crosshair).',
    pasteSomePosts: 'Paste some posts first.',
    successSync: 'Pending offline reports synchronized successfully!',
    trendChartTitle: 'Trend: Reports per hour',
    sentimentChartTitle: 'Sentiment Breakdown'
  },
  hi: {
    report: 'रिपोर्ट दर्ज करें',
    eventType: 'घटना प्रकार',
    source: 'स्रोत',
    filters: 'फ़िल्टर',
    from: 'से',
    to: 'तक',
    location: 'स्थान',
    apply: 'लागू करें',
    reset: 'रीसेट करें',
    hotspots: 'हॉटस्पॉट्स',
    about: 'परिचय',
    unifiedFeed: 'एकीकृत फ़ीड',
    socialMonitor: 'सोशल मॉनिटर',
    newReport: 'नई आपदा रिपोर्ट',
    description: 'विवरण',
    when: 'कब',
    language: 'भाषा',
    locationLabel: 'स्थान',
    media: 'मीडिया (छवियाँ/वीडियो)',
    consent: 'सहमति',
    cancel: 'रद्द करें',
    submit: 'सबमिट करें',
    close: 'बंद करें',
    tagline: 'नागरिक + सोशल खतरा इंटेलिजेंस का एकीकृत मंच',
    roleCitizen: 'नागरिक',
    roleOfficial: 'अधिकारी',
    roleAnalyst: 'विश्लेषक',
    all: 'सभी',
    legendDensity: 'रिपोर्ट घनत्व',
    legendSpikes: 'कीवर्ड स्पाइक्स',
    legendVerified: 'सत्यापित घटनाएँ',
    hotspotsNote: 'हीट लेयर घनत्व दिखाता है; क्लस्टर स्थानीय हॉटस्पॉट दिखाते हैं। मानचित्र नियंत्रण में टॉगल करें।',
    aboutText: 'यह एक परियोजना है जो नागरिकों, स्वयंसेवकों और आपदा प्रबंधकों को रिपोर्ट करने और सामाजिक प्रवृत्तियों की निगरानी करने के लिए एक एकीकृत मंच प्रदान करती है।',
    loadSample: 'नमूना सोशल पोस्ट लोड करें',
    analyze: 'विश्लेषण करें',
    searchPlaceholder: 'उदा., चेन्नई, असम, विशाखापत्तनम',
    pastePostsPlaceholder: 'हालिया सोशल पोस्ट पेस्ट करें, प्रत्येक लाइन में एक।',
    descPlaceholder: 'आपने क्या देखा?',
    noItems: 'कोई आइटम फ़िल्टर से मेल नहीं खाते।',
    geolocationUnsupported: 'जियोलोकेशन समर्थित नहीं है',
    geolocationDenied: 'जियोलोकेशन एक्सेस स्वीकृत नहीं हुआ:',
    provideLocation: 'कृपया एक मान्य स्थान दें (क्रॉसहेयर उपयोग करें)।',
    pasteSomePosts: 'कृपया कुछ पोस्ट पेस्ट करें।',
    successSync: 'ऑफ़लाइन रिपोर्ट सफलतापूर्वक सिंक्रनाइज़ की गईं!',
    trendChartTitle: 'ट्रेंड: प्रति घंटे रिपोर्ट',
    sentimentChartTitle: 'भावना विश्लेषण'
  }
};

/**
 * Translation helper function
 */
export function getTranslation(key: keyof TranslationDictionary, lang: SupportedLanguages = 'en'): string {
  const dictionary = I18N[lang] || I18N['en'];
  return dictionary[key] || key;
}
