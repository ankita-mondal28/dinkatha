import React, { useState, useEffect } from 'react';
import { getEntries } from '../lib/storage';
import { translate } from '../lib/api';
import { t } from '../i18n';

const RANGES = [7, 14, 30];

function Summary({ profile, setScreen }) {
  const [days, setDays] = useState(7);
  const [entries, setEntries] = useState([]);
  const [englishMap, setEnglishMap] = useState({});
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    const all = getEntries();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const filtered = all
      .filter(e => new Date(e.date) >= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date));
    setEntries(filtered);
  }, [days]);

  const hasDemoData = entries.some(e => e.demo);
  const hasHardParts = entries.some(e => e.hardParts);

  const handleEnglish = async () => {
    setTranslating(true);
    const result = {};
    for (const entry of entries) {
      const texts = Object.values(entry.sections).filter(Boolean);
      const res = await translate(texts);
      if (res.error === 'key_not_set') {
        result[entry.id] = null; // show fallback message
      } else if (!res.error) {
        const keys = Object.keys(entry.sections).filter(k => entry.sections[k]);
        result[entry.id] = {};
        keys.forEach((k, i) => {
          result[entry.id][k] = res.translations[i] || entry.sections[k];
        });
      }
    }
    setEnglishMap(result);
    setTranslating(false);
  };

  const shareWhatsapp = () => {
    let text = `Dinkatha – ${profile.name}\n${new Date().toLocaleDateString()}\n\n`;
    entries.forEach(e => {
      text += `📅 ${e.date}\n`;
      if (e.sections.sleep) text += `Sleep: ${e.sections.sleep}\n`;
      if (e.sections.food) text += `Food: ${e.sections.food}\n`;
      if (e.sections.hard) text += `Hard: ${e.sections.hard}\n`;
      if (e.sections.good) text += `Good: ${e.sections.good}\n`;
      text += '\n';
    });
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  };

  return (
    <div className="summary" lang={profile.lang}>
      <div className="summary-doc">
        <h1 className="no-print">Doctor Summary</h1>

        <div className="summary-header">
          <h2>Dinkatha – {profile.name}</h2>
          <p>{entries.length > 0 ? `${entries[0].date} – ${entries[entries.length - 1].date}` : '—'}</p>
          <p className="disclaimer">Reported by parent. Not a medical record.</p>
        </div>

        <div className="range-buttons no-print">
          {RANGES.map(r => (
            <button key={r} className={days === r ? 'active' : ''} onClick={() => setDays(r)}>
              {r} days
            </button>
          ))}
        </div>

        {entries.length === 0 && <p>No entries in this range.</p>}

        {entries.map(entry => {
          const eng = englishMap[entry.id];
          const noKey = eng === null;
          return (
            <div key={entry.id} className="entry-block">
              <h3>{entry.date}</h3>

              {['sleep', 'food', 'hard', 'good'].map(sec => {
                const label = { sleep: 'Sleep', food: 'Food', hard: 'Hard moment', good: 'Good moment' }[sec];
                const text = entry.sections[sec];
                if (!text) return null;
                return (
                  <div key={sec} className="section-row">
                    <strong>{label}:</strong>
                    <p>{text}</p>
                    {sec === 'hard' && entry.hardParts && (
                      <div className="hard-parts">
                        {entry.hardParts.before && <p><em>Before:</em> {entry.hardParts.before}</p>}
                        {entry.hardParts.happened && <p><em>What happened:</em> {entry.hardParts.happened}</p>}
                        {entry.hardParts.helped && <p><em>What helped:</em> {entry.hardParts.helped}</p>}
                      </div>
                    )}
                    {eng && !noKey && eng[sec] && (
                      <p className="english-translation"><em>English:</em> {eng[sec]}</p>
                    )}
                    {noKey && <p className="english-translation">AI key not set, showing original words.</p>}
                  </div>
                );
              })}

              {entry.sections.other && (
                <div className="section-row">
                  <strong>Other notes:</strong>
                  <p>{entry.sections.other}</p>
                </div>
              )}

              {entry.questionsForDoctor && entry.questionsForDoctor.length > 0 && (
                <div className="section-row">
                  <strong>Questions for the doctor:</strong>
                  <ul>{entry.questionsForDoctor.map((q, i) => <li key={i}>{q}</li>)}</ul>
                </div>
              )}

              {entry.demo && <p className="demo-badge">Sample entry</p>}
            </div>
          );
        })}

        {hasHardParts && (
          <p className="footnote">Some lines were organized by software from the parent's own words.</p>
        )}
        {hasDemoData && (
          <p className="footnote">Includes sample data.</p>
        )}
      </div>

      <div className="summary-actions no-print">
        <button onClick={() => window.print()}>🖨️ Print / Save as PDF</button>
        <button onClick={shareWhatsapp}>💬 Share on WhatsApp</button>
        <button onClick={handleEnglish} disabled={translating}>
          {translating ? 'Translating…' : '🌐 English version'}
        </button>
        <button onClick={() => setScreen('home')}>← Back</button>
      </div>
    </div>
  );
}

export default Summary;
