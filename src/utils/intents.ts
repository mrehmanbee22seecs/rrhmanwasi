export type DetectedLanguage = 'ur' | 'en';

export function detectLanguage(text: string): DetectedLanguage {
  const hasUrdu = /[\u0600-\u06FF]/.test(text);
  return hasUrdu ? 'ur' : 'en';
}

interface Intent {
  id: string;
  patterns: RegExp[];
  reply: (lang: DetectedLanguage) => string;
}

const intents: Intent[] = [
  {
    id: 'greeting',
    patterns: [/^(hi|hello|hey|salam|salaam|as\s*sal(am|aam)\s*alaikum)/i, /السلام|السلام علیکم/i],
    reply: (lang) =>
      lang === 'ur'
        ? 'وعلیکم السلام! میں وسیلہ کی مدد کے لیے حاضر ہوں۔ آپ کس بارے میں جاننا چاہتے ہیں؟'
        : "Hello! I'm here to help with Wasilah. What would you like to know?",
  },
  {
    id: 'thanks',
    patterns: [/^(thanks|thank you|shukriya|shukria)/i, /شکریہ/i],
    reply: (lang) => (lang === 'ur' ? 'خوش رہیں! مزید مدد چاہیے تو بتائیں۔' : 'You’re welcome! Let me know if you need anything else.'),
  },
  {
    id: 'goodbye',
    patterns: [/^(bye|goodbye|khuda hafiz|khudahafiz)/i, /خدا حافظ/i],
    reply: (lang) => (lang === 'ur' ? 'خدا حافظ! آپ کا دن خوشگوار رہے۔' : 'Goodbye! Have a great day.'),
  },
  {
    id: 'help',
    patterns: [/help|madad|assist|support/i, /مدد/i],
    reply: (lang) =>
      lang === 'ur'
        ? 'میں مدد کیلئے حاضر ہوں: پروجیکٹس، رضاکارانہ خدمات، ایونٹس، یا رابطہ معلومات کے بارے میں پوچھیں۔'
        : 'I can help with projects, volunteering, events, or contact info. What would you like to know?',
  },
];

export function matchIntent(text: string): { handled: boolean; reply?: string } {
  const lang = detectLanguage(text);
  for (const intent of intents) {
    if (intent.patterns.some((re) => re.test(text))) {
      return { handled: true, reply: intent.reply(lang) };
    }
  }
  return { handled: false };
}

export function adminOfferMessage(lang: DetectedLanguage) {
  return lang === 'ur'
    ? "اگر آپ کا سوال حل نہیں ہوا تو کیا آپ ایڈمن سے بات کرنا چاہیں گے؟ 'ہاں' لکھیں، ہم فوراً رابطہ کروا دیں گے۔"
    : "If that didn’t answer your question, would you like to talk to an admin? Reply 'yes' and we’ll connect you shortly.";
}

export function adminConfirmMessage(lang: DetectedLanguage) {
  return lang === 'ur'
    ? 'ٹھیک ہے! ایک ایڈمن جلد آپ کے ساتھ ہوگا۔'
    : 'Great! An admin will be with you shortly.';
}
