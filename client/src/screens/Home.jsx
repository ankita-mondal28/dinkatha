import React, { useEffect, useState } from 'react';
import { t, setLanguage } from '../i18n';
import { getEntries, saveEntry, clearAll } from '../lib/storage';

function Home({ profile, onStart, setScreen }) {
  const [entries, setEntries] = useState([]);
  const [aiStatus, setAiStatus] = useState('checking');

  useEffect(() => {
    setEntries(getEntries().slice(-10).reverse());
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setAiStatus(d.aiConfigured ? 'ready' : 'not_set'))
      .catch(() => setAiStatus('not_set'));
  }, []);

  const loadDemo = async () => {
    const { demoEntries } = await import('../lib/demo.js');
    demoEntries.forEach(e => saveEntry(e));
    setEntries(getEntries().slice(-10).reverse());
  };

  const handleClear = () => {
    if (window.confirm('Clear all data? This cannot be undone.')) {
      clearAll();
      setEntries([]);
      window.location.reload();
    }
  };

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    const stored = JSON.parse(localStorage.getItem('dinkatha.profile') || '{}');
    stored.lang = newLang;
    localStorage.setItem('dinkatha.profile', JSON.stringify(stored));
    window.location.reload();
  };

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <main className="home" lang={profile.lang}>
      <header className="home-header">
        <h1>{profile.name}</h1>
        <p className="today-date">{today}</p>
        <span className={`chip chip--${aiStatus}`}>
          {aiStatus === 'ready' ? t('aiReady') : t('aiNotSet')}
        </span>
      </header>

      <button className="big-btn" onClick={onStart}>
        <svg aria-hidden="true" focusable="false" className="mic-icon" viewBox="0 0 24 24" width="32" height="32"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="2" width="6" height="12" rx="3"/>
          <path d="M5 10a7 7 0 0 0 14 0"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
        {t('startDiary')}
      </button>

      <section className="recent-entries" aria-label="Recent entries">
        <h2>Recent entries</h2>
        {entries.length === 0 && <p className="empty-msg">No entries yet.</p>}
        <ul className="entry-list">
          {entries.map(e => (
            <li key={e.id}>
              <button className="entry-row" onClick={() => { setScreen('entry', e.id); }}>
                <span className="entry-date">{e.date}</span>
                <span className="entry-preview">{e.sections?.sleep?.slice(0, 40) || '—'}</span>
                {e.demo && <span className="demo-tag">demo</span>}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="home-actions">
        <button className="action-btn" onClick={() => setScreen('summary')}>{t('doctorSummary')}</button>
      </div>

      <footer className="home-footer">
        <label htmlFor="lang-select" className="sr-only">{t('changeLanguage')}</label>
        <select id="lang-select" defaultValue={profile.lang} onChange={handleLangChange}>
          <option value="en">English</option>
          <option value="bn">বাংলা</option>
          <option value="hi">हिन्दी</option>
        </select>
        <button className="footer-btn" onClick={loadDemo}>{t('loadDemo')}</button>
        <button className="footer-btn footer-btn--danger" onClick={handleClear}>{t('clearAll')}</button>
      </footer>
    </main>
  );
}

export default Home;
