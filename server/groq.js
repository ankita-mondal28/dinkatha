const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const API_KEY = process.env.GROQ_API_KEY;

function abortAfter(ms, controller) {
  setTimeout(() => controller.abort(), ms);
}

export async function callGroq(system, user, timeout = 20000) {
  if (!API_KEY) {
    const err = new Error('key_not_set');
    err.code = 501;
    throw err;
  }
  const controller = new AbortController();
  abortAfter(timeout, controller);
  const body = {
    model: MODEL,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  };
  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
    signal: controller.signal,
  });
  if (!res.ok) {
    const err = new Error('groq_request_failed');
    err.code = res.status;
    throw err;
  }
  const data = await res.json();
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch {
    return {};
  }
}
