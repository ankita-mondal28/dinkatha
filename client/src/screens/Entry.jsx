import React, { useState, useEffect } from 'react';
import { getEntries, saveEntry, deleteEntry } from '../lib/storage';
import { t } from '../i18n';

function Entry({ profile, entryId, setScreen }) {
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    const all = getEntries();
    // If no entryId, show the most recent
    const found = entryId ? all.find(e => e.id === entryId) : all[all.length - 1];
    if (found) setEntry({ ...found, sections: { ...found.sections } });
  }, [entryId]);

  if (!entry) return <main className="entry" lang={profile.lang}><p>Entry not found.</p><button onClick={() => setScreen('home')}>← Back</button></main>;

  const handleChange = (sec, val) => {
    setEntry(prev => ({ ...prev, sections: { ...prev.sections, [sec]: val } }));
  };

  const handleSave = () => {
    saveEntry(entry);
    setScreen('home');
  };

  const handleDelete = () => {
    if (window.confirm('Delete this entry?')) {
      deleteEntry(entry.id);
      setScreen('home');
    }
  };

  const labels = { sleep: 'Sleep', food: 'Food', hard: 'Hard moment', good: 'Good moment', other: 'Other notes' };

  return (
    <main className="entry" lang={profile.lang}>
      <h1>Entry – {entry.date}</h1>
      {Object.keys(labels).map(sec => (
        <div key={sec} className="entry-section">
          <label htmlFor={`sec-${sec}`}>{labels[sec]}</label>
          <textarea
            id={`sec-${sec}`}
            rows={3}
            value={entry.sections[sec] || ''}
            onChange={e => handleChange(sec, e.target.value)}
          />
        </div>
      ))}
      {entry.hardParts && (
        <div className="entry-section">
          <p><strong>Before:</strong> {entry.hardParts.before}</p>
          <p><strong>What happened:</strong> {entry.hardParts.happened}</p>
          <p><strong>What helped:</strong> {entry.hardParts.helped}</p>
        </div>
      )}
      <div className="entry-actions">
        <button className="big-btn" onClick={handleSave}>Save changes</button>
        <button className="danger-btn" onClick={handleDelete}>Delete entry</button>
        <button className="sec-btn" onClick={() => setScreen('home')}>← Back</button>
      </div>
    </main>
  );
}

export default Entry;
