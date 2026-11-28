import React, { useState, useEffect } from 'react';
import Welcome from './screens/Welcome.jsx';
import Home from './screens/Home.jsx';
import Session from './screens/Session.jsx';
import Entry from './screens/Entry.jsx';
import Summary from './screens/Summary.jsx';
import { getProfile, saveProfile } from './lib/storage.js';
import { setLanguage } from './i18n.js';
import './styles/app.css';

function App() {
  const [screen, setScreenState] = useState('loading');
  const [profile, setProfile] = useState(null);
  const [entryId, setEntryId] = useState(null);

  useEffect(() => {
    const stored = getProfile();
    if (stored) {
      setProfile(stored);
      setLanguage(stored.lang);
      setScreenState('home');
    } else {
      setScreenState('welcome');
    }
  }, []);

  const setScreen = (name, id) => {
    if (id !== undefined) setEntryId(id);
    setScreenState(name);
  };

  const handleProfileSaved = (p) => {
    saveProfile(p);
    setProfile(p);
    setLanguage(p.lang);
    setScreenState('home');
  };

  const lang = profile?.lang || 'en';

  if (screen === 'loading') return null;

  return (
    <div className="app-root" lang={lang}>
      {screen === 'welcome' && <Welcome onComplete={handleProfileSaved} />}
      {screen === 'home' && profile && <Home profile={profile} onStart={() => setScreen('session')} setScreen={setScreen} />}
      {screen === 'session' && profile && <Session profile={profile} onFinish={() => setScreen('home')} setScreen={setScreen} />}
      {screen === 'entry' && profile && <Entry profile={profile} entryId={entryId} setScreen={setScreen} />}
      {screen === 'summary' && profile && <Summary profile={profile} setScreen={setScreen} />}
    </div>
  );
}

export default App;
