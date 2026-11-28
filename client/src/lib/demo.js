function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export const demoEntries = [
  {
    id: 'demo-1',
    date: daysAgo(6),
    lang: 'bn',
    sections: {
      sleep: 'রাতে ঘুম ভালো হয়েছে, প্রায় ৮ ঘণ্টা।',
      food: 'সকালে ভাত আর ডিম খেয়েছে, দুপুরে একটু কম খেয়েছে।',
      hard: 'বিকেলে স্কুল থেকে এসে কাঁদছিল। বলল মাথা ব্যথা। একটু শুইয়ে দিলাম, ভালো হয়ে গেল।',
      good: 'রাতে গল্প শুনতে শুনতে হেসেছে।',
      other: '',
    },
    hardParts: {
      before: 'স্কুল থেকে ফেরার পরে',
      happened: 'কাঁদছিল, বলল মাথা ব্যথা',
      helped: 'একটু শুইয়ে দিলাম',
    },
    questionsForDoctor: [],
    demo: true,
  },
  {
    id: 'demo-2',
    date: daysAgo(5),
    lang: 'hi',
    sections: {
      sleep: 'रात को 7 बजे सो गया, सुबह 6 बजे उठा। नींद ठीक रही।',
      food: 'नाश्ते में दलिया खाया। दोपहर में रोटी और दाल। शाम को बिस्किट।',
      hard: 'खाना खाने में बहुत ज़िद की। थाली से उठकर भाग गया।',
      good: 'पड़ोस के बच्चे के साथ खेला, बहुत खुश था।',
      other: '',
    },
    hardParts: null,
    questionsForDoctor: [],
    demo: true,
  },
  {
    id: 'demo-3',
    date: daysAgo(4),
    lang: 'en',
    sections: {
      sleep: 'Slept around 9pm, woke up twice at night asking for water.',
      food: 'Ate well at breakfast. Refused lunch. Had some fruit in the evening.',
      hard: 'Had a big meltdown before bath time. He was very tired I think. Holding him and singing helped calm him down.',
      good: 'Laughed a lot while watching a cartoon with his sister.',
      other: '',
    },
    hardParts: {
      before: 'Before bath time, he was very tired',
      happened: 'Had a big meltdown',
      helped: 'Holding him and singing helped calm him down',
    },
    questionsForDoctor: ['He woke up twice at night — is this normal for his age?'],
    demo: true,
  },
  {
    id: 'demo-4',
    date: daysAgo(3),
    lang: 'bn',
    sections: {
      sleep: 'ঘুম একটু দেরিতে হয়েছে, রাত ১০টায়।',
      food: 'সারাদিন ভালোই খেয়েছে। বিকেলে বাইরে থেকে চিপস চেয়েছিল, দিইনি।',
      hard: 'দাদার সাথে ঝগড়া হয়েছিল খেলনা নিয়ে। একটু পরে নিজেই মিটিয়ে নিল।',
      good: 'নিজে নিজে ছবি এঁকে দেখাল। খুব গর্বিত ছিল।',
      other: '',
    },
    hardParts: null,
    questionsForDoctor: [],
    demo: true,
  },
  {
    id: 'demo-5',
    date: daysAgo(2),
    lang: 'hi',
    sections: {
      sleep: 'सोने में देर लगी, 10 बजे के बाद सोया। रात को एक बार उठा।',
      food: 'खाना कम खाया आज। सिर्फ दही-चावल ठीक से खाया।',
      hard: 'स्कूल जाने से मना कर रहा था। रोया भी। थोड़ी देर बाद मान गया।',
      good: 'शाम को माँ के साथ पार्क गया, बहुत खुश आया।',
      other: '',
    },
    hardParts: {
      before: 'स्कूल जाने का समय था',
      happened: 'स्कूल जाने से मना कर रहा था, रोया',
      helped: 'थोड़ी देर में मान गया',
    },
    questionsForDoctor: [],
    demo: true,
  },
  {
    id: 'demo-6',
    date: daysAgo(1),
    lang: 'en',
    sections: {
      sleep: 'Good sleep, about 9 hours. No waking up.',
      food: 'Ate everything today — very good appetite.',
      hard: 'Got very frustrated with a puzzle and threw it. Sat with him quietly and he tried again.',
      good: 'He said "I love you mama" out of nowhere. Made my whole day.',
      other: '',
    },
    hardParts: null,
    questionsForDoctor: [],
    demo: true,
  },
  {
    id: 'demo-7',
    date: daysAgo(0),
    lang: 'bn',
    sections: {
      sleep: 'আজ রাতে এখনো ঘুমায়নি, তবে গতরাত ভালো ছিল।',
      food: 'সকালে মুড়ি আর কলা। দুপুরে ভাত-মাছ।',
      hard: 'বাথরুম যেতে চাইছিল না। অনেকক্ষণ ধরে বুঝিয়ে নিয়ে গেলাম।',
      good: 'নানুকে ভিডিও কলে দেখে হাততালি দিয়েছে।',
      other: '',
    },
    hardParts: null,
    questionsForDoctor: ['বাথরুম করতে এত অনিচ্ছা কেন হচ্ছে?'],
    demo: true,
  },
];
