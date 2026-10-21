import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Editor } from './components/Editor';
import './index.css';
import {
  initialSession,
  startSession,
  pauseSession,
  resumeSession,
  stopSession,
  type WritingSession,
} from './session/session';
import { useSessionTimer } from './session/useSessionTimer';
import { EditorSettings, initialEditorSettings } from './settings/editorSettings';
import { EditorSettingsPopup } from './components/EditorSettingsPopup';

export function App() {
  const [session, setSession] = useState<WritingSession>(initialSession);
  const remainingTime = useSessionTimer({ session, setSession });
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(initialEditorSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    window.electronAPI
      .loadEditorSettings()
      .then((settings) => {
        if (cancelled === false) {
          setEditorSettings(settings);
          setSettingsLoaded(true);
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to load editor settings:', error);

        if (cancelled === false) {
          setSettingsLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (settingsLoaded === false) {
      return;
    }

    window.electronAPI.saveEditorSettings(editorSettings).catch((error: unknown) => {
      console.error('Failed to save editor settings:', error);
    });
  }, [editorSettings, settingsLoaded]);

  useEffect(() => {
    return window.electronAPI.onOpenEditorSettings(() => {
      setIsSettingsOpen(true);
    });
  }, []);

  useEffect(() => {
    const unsubscribeStart = window.electronAPI.onSessionStart(() => {
      setSession((current) => {
        if (current.status !== 'idle' && current.status !== 'finished') {
          return current;
        }

        return startSession(current);
      });
    });

    const unsubscribePause = window.electronAPI.onSessionPause(() => {
      setSession((current) => {
        if (current.status !== 'running') {
          return current;
        }

        return pauseSession(current);
      });
    });

    const unsubscribeResume = window.electronAPI.onSessionResume(() => {
      setSession((current) => {
        if (current.status !== 'paused') {
          return current;
        }

        return resumeSession(current);
      });
    });

    const unsubscribeStop = window.electronAPI.onSessionStop(() => {
      setSession((current) => {
        if (current.status !== 'running' && current.status !== 'paused') {
          return current;
        }

        return stopSession(current);
      });
    });

    return () => {
      unsubscribeStart();
      unsubscribePause();
      unsubscribeResume();
      unsubscribeStop();
    };
  }, []);

  useEffect(() => {
    window.electronAPI.setSessionStatus(session.status);
  }, [session.status]);

  return (
    <main className="h-screen overflow-hidden">
      <Editor settings={editorSettings} shouldFocus={isSettingsOpen === false} />

      {isSettingsOpen && (
        <EditorSettingsPopup
          settings={editorSettings}
          onSettingsChange={setEditorSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </main>
  );
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />,
  </StrictMode>,
);
