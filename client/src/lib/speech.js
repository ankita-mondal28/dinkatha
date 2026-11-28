import { t } from '../i18n';

function startRecognition(lang, onResult, onError) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError('unsupported');
    return { stop: () => {} };
  }
  const recognizer = new SpeechRecognition();
  recognizer.lang = lang;
  recognizer.continuous = true;
  recognizer.interimResults = true;
  let finalTranscript = '';
  let silenceTimer = null;
  const resetSilence = () => {
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => recognizer.stop(), 2000);
  };
  recognizer.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
        resetSilence();
      } else {
        interim += transcript;
      }
    }
    onResult({ final: finalTranscript.trim(), interim: interim.trim() });
  };
  recognizer.onerror = (e) => onError(e.error);
  recognizer.onend = () => {
    clearTimeout(silenceTimer);
    onResult({ final: finalTranscript.trim(), interim: '' });
  };
  recognizer.start();
  return { stop: () => recognizer.stop() };
}

export { startRecognition };
