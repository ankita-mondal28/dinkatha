import React, { useState, useEffect, useRef } from 'react';
import { t } from '../i18n';
import { saveEntry, getEntries } from '../lib/storage';
import { checkSafety } from '../lib/safety';
import { structure } from '../lib/api';

const LANG_MAP = { bn: 'bn-IN', hi: 'hi-IN', en: 'en-IN' };
const ORDER = ['sleep', 'food', 'hard', 'good'];
const QUESTIONS = {
  sleep: () => t('qSleep'),
  food: () => t('qFood'),
  hard: () => t('qHard'),
  good: () => t('qGood'),
};

function Session({ profile, onFinish, setScreen }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [listening, setListening] = useState(false);
  const [phase, setPhase] = useState('speaking'); // speaking | listening | confirm | hardparts | addnote | done
  const [sections, setSections] = useState({ sleep: '', food: '', hard: '', good: '', other: '' });
  const [hardParts, setHardParts] = useState(null);
  const [structuring, setStructuring] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [addNote, setAddNote] = useState('');
  const [questionsForDoctor, setQuestionsForDoctor] = useState([]);
  const [safetyAlert, setSafetyAlert] = useState(null);
  const [aiConfigured, setAiConfigured] = useState(false);
  const recognizerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const nothingTimerRef = useRef(null);

  const step = ORDER[stepIdx];

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setAiConfigured(d.aiConfigured))
      .catch(() => {});
  }, []);

  // Speak the question then start listening
  useEffect(() => {
    if (phase !== 'speaking') return;
    const question = QUESTIONS[step]();
    if (!('speechSynthesis' in window)) {
      setPhase('listening');
      startListening();
      return;
    }
    const utter = new SpeechSynthesisUtterance(question);
    utter.lang = LANG_MAP[profile.lang] || 'en-IN';
    utter.onend = () => {
      setPhase('listening');
      startListening();
    };
    // If TTS doesn't fire onend within 8s fall back
    const fallback = setTimeout(() => {
      speechSynthesis.cancel();
      setPhase('listening');
      startListening();
    }, 8000);
    utter.onend = () => { clearTimeout(fallback); setPhase('listening'); startListening(); };
    speechSynthesis.speak(utter);
    return () => { speechSynthesis.cancel(); clearTimeout(fallback); };
  }, [step, phase]);

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setPhase('typeonly');
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = LANG_MAP[profile.lang] || 'en-IN';
    rec.continuous = true;
    rec.interimResults = true;
    recognizerRef.current = rec;

    let finalText = '';
    let heardSomething = false;

    // 6s nothing-heard timeout
    nothingTimerRef.current = setTimeout(() => {
      if (!heardSomething) {
        rec.stop();
        if (retryCount < 2) {
          setRetryCount(r => r + 1);
          setPhase('retry');
        } else {
          setTranscript('');
          advanceStep('');
        }
      }
    }, 6000);

    // 60s hard cutoff
    const hardStop = setTimeout(() => rec.stop(), 60000);

    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          heardSomething = true;
          finalText += e.results[i][0].transcript + ' ';
          clearTimeout(nothingTimerRef.current);
          // 2s silence after last final word
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => rec.stop(), 2000);
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      setTranscript(finalText.trim());
      setInterim(interim);
    };

    rec.onerror = (e) => {
      if (e.error === 'not-allowed') setPhase('denied');
    };

    rec.onend = () => {
      clearTimeout(hardStop);
      clearTimeout(nothingTimerRef.current);
      clearTimeout(silenceTimerRef.current);
      setListening(false);
      setInterim('');
      setPhase('confirm');
    };

    rec.start();
    setListening(true);
  }

  function stopListening() {
    if (recognizerRef.current) recognizerRef.current.stop();
  }

  function handleDone() { stopListening(); }

  function handleSkip() {
    stopListening();
    advanceStep('');
  }

  function handleRepeat() {
    stopListening();
    setTranscript('');
    setRetryCount(0);
    setPhase('speaking');
  }

  async function handleConfirm() {
    const text = transcript.trim();
    const safety = checkSafety(text);

    if (safety?.type === 'emergency') {
      setSafetyAlert('emergency');
      return;
    }
    if (safety?.type === 'distress') setSafetyAlert('distress');
    if (safety?.type === 'advice') {
      setQuestionsForDoctor(q => [...q, text]);
      setSafetyAlert('advice');
    }

    if (step === 'hard' && aiConfigured && text) {
      setStructuring(true);
      const res = await structure(text);
      setStructuring(false);
      if (!res.error) {
        setHardParts({ before: res.before || null, happened: res.happened || null, helped: res.helped || null });
        setSections(s => ({ ...s, hard: text }));
        setPhase('hardparts');
        return;
      }
    }

    advanceStep(text);
  }

  async function handleHardConfirm() {
    advanceStep(sections.hard || transcript.trim());
  }

  function advanceStep(text) {
    setSections(s => ({ ...s, [step]: text }));
    if (stepIdx < ORDER.length - 1) {
      setStepIdx(i => i + 1);
      setTranscript('');
      setInterim('');
      setRetryCount(0);
      setPhase('speaking');
    } else {
      setPhase('addnote');
    }
  }

  async function handleSaveNote() {
    const note = addNote.trim();
    const finalSections = { ...sections };
    if (note) {
      // classify silently; fall back to 'other'
      let noteSection = 'other';
      try {
        const res = await fetch('/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: note }),
        });
        if (res.ok) {
          const d = await res.json();
          noteSection = d.section || 'other';
        }
      } catch {}
      finalSections[noteSection] = (finalSections[noteSection] ? finalSections[noteSection] + '\n' : '') + note;
    }

    const existing = getEntries().find(e => e.date === new Date().toISOString().slice(0, 10));
    if (existing && !window.confirm('An entry already exists for today. Replace it?')) return;

    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      lang: profile.lang,
      sections: finalSections,
      hardParts: hardParts || null,
      questionsForDoctor,
      demo: false,
    };

    saveEntry(entry);
    setPhase('done');
    setTimeout(() => onFinish(), 2000);
  }

  // ——— Render ———

  if (safetyAlert === 'emergency') {
    return (
      <div role="alertdialog" aria-modal="true" aria-labelledby="em-title" className="safety-overlay">
        <div className="safety-box emergency">
          <h2 id="em-title">⚠️ {t('emergency')}</h2>
          <a href="tel:112" className="emergency-link">📞 112</a>
          <button onClick={() => setSafetyAlert(null)} className="back-btn">← Back</button>
        </div>
      </div>
    );
  }

  if (phase === 'denied' || phase === 'typeonly') {
    return (
      <main className="session" lang={profile.lang}>
        <p className="voice-unavail">Voice works in Chrome or Edge. You can type instead.</p>
        <h2>{QUESTIONS[step]()}</h2>
        <textarea rows={5} value={transcript} onChange={e => setTranscript(e.target.value)} />
        <button className="big-btn" onClick={handleConfirm}>Next →</button>
        <button className="skip-btn" onClick={handleSkip}>Skip</button>
      </main>
    );
  }

  if (phase === 'retry') {
    return (
      <main className="session" lang={profile.lang}>
        <h2>{QUESTIONS[step]()}</h2>
        <p className="retry-msg">I couldn't hear that clearly, please say it once more. Try moving somewhere quieter.</p>
        <div className="controls">
          <button className="big-btn" onClick={() => { setPhase('listening'); startListening(); }}>Try again</button>
          <button className="skip-btn" onClick={handleSkip}>Skip</button>
          <button className="type-btn" onClick={() => setPhase('typeonly')}>Type instead</button>
        </div>
      </main>
    );
  }

  if (phase === 'confirm') {
    return (
      <main className="session" lang={profile.lang}>
        {safetyAlert === 'distress' && <p className="safety-msg distress">{t('distress')}</p>}
        {safetyAlert === 'advice' && <p className="safety-msg advice">{t('advice')}</p>}
        <h2>{QUESTIONS[step]()}</h2>
        <label htmlFor="transcript-edit">Your words:</label>
        <textarea id="transcript-edit" rows={5} value={transcript} onChange={e => setTranscript(e.target.value)} />
        <div className="controls">
          <button className="big-btn" onClick={handleConfirm}>Looks right ✓</button>
          <button className="sec-btn" onClick={handleRepeat}>Say again</button>
          <button className="skip-btn" onClick={handleSkip}>Skip</button>
        </div>
      </main>
    );
  }

  if (phase === 'hardparts') {
    return (
      <main className="session" lang={profile.lang}>
        <h2>Organised from your words</h2>
        <div className="hard-parts-edit">
          <label>Before</label>
          <textarea rows={2} value={hardParts.before || ''} onChange={e => setHardParts(h => ({ ...h, before: e.target.value }))} />
          <label>What happened</label>
          <textarea rows={2} value={hardParts.happened || ''} onChange={e => setHardParts(h => ({ ...h, happened: e.target.value }))} />
          <label>What helped</label>
          <textarea rows={2} value={hardParts.helped || ''} onChange={e => setHardParts(h => ({ ...h, helped: e.target.value }))} />
        </div>
        <div className="controls">
          <button className="big-btn" onClick={handleHardConfirm}>Looks right ✓</button>
          <button className="sec-btn" onClick={() => advanceStep(sections.hard || transcript)}>Use original text</button>
        </div>
      </main>
    );
  }

  if (phase === 'addnote') {
    return (
      <main className="session" lang={profile.lang}>
        <h2>{t('addNote')}</h2>
        <p className="review-preview">
          {ORDER.map(s => sections[s] ? <span key={s}><strong>{s}:</strong> {sections[s].slice(0, 40)}… </span> : null)}
        </p>
        <textarea rows={4} value={addNote} onChange={e => setAddNote(e.target.value)} placeholder="Optional…" />
        <div className="controls">
          <button className="big-btn" onClick={handleSaveNote}>Save entry</button>
        </div>
      </main>
    );
  }

  if (phase === 'done') {
    return (
      <main className="session done" lang={profile.lang}>
        <p className="done-msg">
          Saved 🌿 {sections.good ? `"${sections.good.slice(0, 60)}"` : 'Thank you for today.'}
        </p>
      </main>
    );
  }

  if (structuring) {
    return <main className="session" lang={profile.lang}><p>Organising your words…</p></main>;
  }

  // Default: speaking/listening
  return (
    <main className="session" lang={profile.lang}>
      <p className="step-counter">{stepIdx + 1} / {ORDER.length}</p>
      <h2 className="question">{QUESTIONS[step]()}</h2>
      {listening && <div className="pulse-ring" aria-label="Listening" />}
      <p className="interim">{interim}</p>
      <div className="controls">
        <button className="big-btn" onClick={handleDone}>Done</button>
        <button className="sec-btn" onClick={handleSkip}>Skip</button>
        <button className="sec-btn" onClick={handleRepeat}>Repeat question</button>
        <button className="type-btn" onClick={() => { stopListening(); setPhase('confirm'); }}>Type instead</button>
      </div>
    </main>
  );
}

export default Session;
