const emergencyPhrases = [
  'not breathing', 'seizure', 'unconscious', 'danger', 'emergency', 'child is hurt', 'seriously hurt',
  'শ্বাস নিচ্ছে না', 'খিঁচুনি', 'অজ্ঞান', 'বিপদ', 'গুরুতর আহত',
  'সांस नहीं ले रहा', 'दौरा', 'बेहोश', 'खतरा', 'गंभीर चोट',
];

const distressPhrases = [
  'hopeless', "can't do this anymore", "can't cope", 'want to give up', 'no hope',
  'হতাশ', 'আর পারছি না', 'ছেড়ে দিতে চাই',
  'निराश', 'अब नहीं कर पाऊँगा', 'हार मान लूँ',
];

const advicePhrases = [
  'what should i do', 'what do i do', 'should i give', 'ki korbo', 'kya karun', 'kya karoon',
  'কী করব', 'কী করা উচিত', 'क्या करूँ', 'क्या करना चाहिए',
];

export function checkSafety(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const p of emergencyPhrases) if (lower.includes(p.toLowerCase())) return { type: 'emergency' };
  for (const p of distressPhrases) if (lower.includes(p.toLowerCase())) return { type: 'distress' };
  for (const p of advicePhrases) if (lower.includes(p.toLowerCase())) return { type: 'advice' };
  return null;
}
