import express from 'express';
import { callGroq } from './groq.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '200kb' }));

// In-memory rate limiter — 30 requests per minute per IP
const rateMap = new Map();
function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const record = rateMap.get(ip) || { count: 0, start: now };
  if (now - record.start > 60000) { record.count = 0; record.start = now; }
  record.count += 1;
  rateMap.set(ip, record);
  if (record.count > 30) return res.status(429).json({ error: 'rate_limit_exceeded' });
  next();
}
app.use('/api', rateLimiter);

function validate(text) {
  return typeof text === 'string' && text.length > 0 && text.length <= 1500;
}

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', aiConfigured: Boolean(process.env.GROQ_API_KEY) });
});

// POST /api/translate
app.post('/api/translate', async (req, res) => {
  const { texts } = req.body;
  if (!Array.isArray(texts) || texts.length > 40) return res.status(400).json({ error: 'invalid_input' });
  if (!process.env.GROQ_API_KEY) return res.status(501).json({ error: 'key_not_set' });
  for (const txt of texts) {
    if (!validate(txt)) return res.status(400).json({ error: 'invalid_text' });
  }
  try {
    const system = [
      'You are a faithful translator.',
      'Translate each user message to English exactly as written, preserving names.',
      'Do not add, remove, interpret, explain or advise.',
      'If a phrase is unclear keep it and append [unclear].',
      'Return JSON: { "translations": ["...", "..."] } in the same order as input.',
      'Input may be a JSON array of strings or a single string.',
    ].join(' ');
    const result = await callGroq(system, JSON.stringify(texts));
    const translations = Array.isArray(result?.translations) ? result.translations : texts;
    res.json({ translations });
  } catch (e) {
    if (e.code === 501) return res.status(501).json({ error: 'key_not_set' });
    res.status(500).json({ error: 'internal' });
  }
});

// POST /api/structure
app.post('/api/structure', async (req, res) => {
  const { text } = req.body;
  if (!validate(text)) return res.status(400).json({ error: 'invalid_input' });
  if (!process.env.GROQ_API_KEY) return res.status(501).json({ error: 'key_not_set' });
  try {
    const system = [
      'The input is a parent describing a hard moment, in Bengali, Hindi, English or a mix.',
      'Use ONLY what the parent said.',
      'Copy their exact wording in their original language.',
      'Return JSON: { "before": "...", "happened": "...", "helped": "..." }',
      'Use null for any part not mentioned.',
      'Never infer causes. Never add explanations, labels or advice.',
    ].join(' ');
    const result = await callGroq(system, text);

    // Safety filter: reject if prohibited words appear in output but NOT in input
    const prohibited = ['should', 'must', 'normal', 'abnormal', 'improving', 'worsening',
      'symptom', 'diagnosis', 'diagnose', 'therapy', 'medication'];
    const lowerInput = text.toLowerCase();
    const outStr = JSON.stringify(result).toLowerCase();
    for (const w of prohibited) {
      if (outStr.includes(w) && !lowerInput.includes(w)) {
        return res.status(502).json({ error: 'rejected' });
      }
    }
    res.json({ before: result.before || null, happened: result.happened || null, helped: result.helped || null });
  } catch (e) {
    if (e.code === 501) return res.status(501).json({ error: 'key_not_set' });
    res.status(500).json({ error: 'internal' });
  }
});

// POST /api/classify
app.post('/api/classify', async (req, res) => {
  const { text } = req.body;
  if (!validate(text)) return res.status(400).json({ error: 'invalid_input' });
  if (!process.env.GROQ_API_KEY) return res.status(501).json({ error: 'key_not_set' });
  try {
    const system = [
      'Classify the given text into exactly one of: sleep, food, hard, good, other.',
      'Return JSON: { "section": "sleep" } (or food / hard / good / other).',
      'If unsure, return other.',
    ].join(' ');
    const result = await callGroq(system, text);
    const valid = ['sleep', 'food', 'hard', 'good', 'other'];
    const section = valid.includes(result?.section) ? result.section : 'other';
    res.json({ section });
  } catch (e) {
    if (e.code === 501) return res.status(501).json({ error: 'key_not_set' });
    res.status(500).json({ error: 'internal' });
  }
});

// Serve built client
if (process.env.NODE_ENV === 'production') {
  const distDir = path.resolve(__dirname, '../client/dist');
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Dinkatha server listening on http://localhost:${port}`);
});
