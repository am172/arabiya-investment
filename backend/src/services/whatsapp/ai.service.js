require('../../config/env');

const TIMEOUT_MS = 20000;

const request = async (url, options) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const askGroq = async (system, history, text) => {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY is not set');

  const res = await request('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 450,
      messages: [
        { role: 'system', content: system },
        ...history.map((item) => ({
          role: item.role === 'bot' ? 'assistant' : 'user',
          content: item.text
        })),
        { role: 'user', content: text }
      ]
    })
  });

  if (!res.ok) throw new Error(`Groq responded with ${res.status}`);
  const data = await res.json();
  return ((data.choices && data.choices[0] && data.choices[0].message.content) || '').trim();
};

const toGeminiContents = (history, text) => {
  const contents = [];
  [...history.map((item) => ({ role: item.role === 'bot' ? 'model' : 'user', text: item.text })), { role: 'user', text }].forEach(
    (item) => {
      const last = contents[contents.length - 1];
      if (last && last.role === item.role) last.parts[0].text += `\n${item.text}`;
      else contents.push({ role: item.role, parts: [{ text: item.text }] });
    }
  );
  return contents;
};

const askGemini = async (system, history, text) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const res = await request(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: toGeminiContents(history, text),
      generationConfig: { temperature: 0.4, maxOutputTokens: 450 }
    })
  });

  if (!res.ok) throw new Error(`Gemini responded with ${res.status}`);
  const data = await res.json();
  const parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
  return parts.map((part) => part.text || '').join('').trim();
};

const PROVIDERS = { groq: askGroq, gemini: askGemini };

const generate = async (provider, system, history, text) => {
  const order = provider === 'gemini' ? ['gemini', 'groq'] : ['groq', 'gemini'];
  let lastError = null;

  for (const name of order) {
    try {
      const answer = await PROVIDERS[name](system, history, text);
      if (answer) return answer;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('No AI provider returned an answer');
};

const configured = () => ({
  groq: Boolean(process.env.GROQ_API_KEY),
  gemini: Boolean(process.env.GEMINI_API_KEY)
});

module.exports = { generate, configured };