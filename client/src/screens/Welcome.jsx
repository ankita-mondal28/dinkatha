import React, { useState } from 'react';
import { t, setLanguage } from '../i18n';
import { saveProfile } from '../lib/storage';

function Welcome({ onComplete }) {
  const [lang, setLang] = useState('en');
  const [name, setName] = useState('');

  const handleStart = () => {
    if (!name.trim()) return;
    onComplete({ name: name.trim(), lang });
  };

  const chooseLang = (code) => {
    setLang(code);
    setLanguage(code);
  };

  const readConsent = () => {
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(t('consentFull'));
    const langMap = { bn: 'bn-IN', hi: 'hi-IN', en: 'en-US' };
    utter.lang = langMap[lang] || 'en-US';
    speechSynthesis.speak(utter);
  };

  return (
    <main className="welcome" lang={lang}>
      <h1>{t('welcome')}</h1>

      <div className="lang-buttons" role="group" aria-label="Choose language">
        <button className={`lang-btn ${lang === 'bn' ? 'active' : ''}`} onClick={() => chooseLang('bn')}>বাংলা</button>
        <button className={`lang-btn ${lang === 'hi' ? 'active' : ''}`} onClick={() => chooseLang('hi')}>हिन्दी</button>
        <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => chooseLang('en')}>English</button>
      </div>

      <label className="name-label" htmlFor="child-name">{t('childName')}</label>
      <input
        id="child-name"
        className="name-input"
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleStart()}
        autoComplete="off"
      />

      <div className="consent-block">
        <p className="consent-text">{t('consentFull')}</p>
        <button className="icon-btn" onClick={readConsent} aria-label="Read consent aloud">
          <svg aria-hidden="true" focusable="false" width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
        </button>
      </div>

      <button className="start-btn" onClick={handleStart} disabled={!name.trim()}>
        {t('startDiary')}
      </button>
    </main>
  );
}

export default Welcome;
