import { StrictMode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Editor } from './editor/components/Editor';
import { EditorSettingsPopup } from './editor/components/EditorSettingsPopup';
import { EditorSettings, initialEditorSettings } from './editor/settings/editorSettings';
import './index.css';
import { FloatingTimer } from './session/components/FloatingTimer';
import { SessionPausedPopup } from './session/components/SessionPausedPopup';
import { SessionSettingsPopup } from './session/components/SessionSettingsPopup';
import { SessionSummaryPopup } from './session/components/SessionSummaryPopup';
import { useSessionTimer } from './session/hooks/useSessionTimer';
import {
  initialSession,
  pauseSession,
  resumeSession,
  startSession,
  stopSession,
  type WritingSession,
} from './session/session';

export function App() {
  const [session, setSession] = useState<WritingSession>(initialSession);
  const remainingTime = useSessionTimer({ session, setSession });
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(initialEditorSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [isSessionSettingsOpen, setIsSessionSettingsOpen] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const wasFocusBlocked = useRef(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summary, setSummary] = useState<{
    elapsedTime: number;
    completedNaturally: boolean;
    wordCount: number;
  } | null>(null);

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
        if (current.status === 'idle' || current.status === 'finished') {
          setIsSessionSettingsOpen(true);
        }

        return current;
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

  const handleStartSession = (durationMs: number) => {
    setSession((current) =>
      startSession({
        ...current,
        mode: 'timed',
        duration: durationMs,
        remainingTime: durationMs,
      }),
    );

    setIsSessionSettingsOpen(false);
  };

  useLayoutEffect(() => {
    const isFocusBlocked =
      isSettingsOpen || isSessionSettingsOpen || isSummaryOpen || session.status === 'paused';

    if (wasFocusBlocked.current === true && isFocusBlocked === false) {
      editorRef.current?.focus();
    }

    wasFocusBlocked.current = isFocusBlocked;
  }, [isSettingsOpen, isSessionSettingsOpen, isSummaryOpen, session.status]);

  const handleStartAgain = () => {
    setSession((current) => startSession(current));

    setIsSummaryOpen(false);
    setSummary(null);
  };

  const handleFinishSession = (wordCount: number) => {
    setSummary({
      elapsedTime: Math.max(0, (session.duration ?? 0) - (session.remainingTime ?? 0)),
      completedNaturally: session.remainingTime === 0,
      wordCount,
    });

    setIsSummaryOpen(true);
  };

  useEffect(() => {
    window.electronAPI.setSessionStatus(session.status);
  }, [session.status]);

  const handleResumeSession = () => {
    setSession((current) => {
      if (current.status !== 'paused') {
        return current;
      }

      return resumeSession(current);
    });
  };

  return (
    <main className="h-screen overflow-hidden">
      <Editor
        ref={editorRef}
        settings={editorSettings}
        sessionStatus={session.status}
        onSessionFinished={handleFinishSession}
      />

      {session.status === 'running' && <FloatingTimer remainingTime={remainingTime} />}

      {isSettingsOpen && (
        <EditorSettingsPopup
          settings={editorSettings}
          onSettingsChange={setEditorSettings}
          onClose={() => {
            setIsSettingsOpen(false);
          }}
        />
      )}

      {isSessionSettingsOpen && (
        <SessionSettingsPopup
          onStart={handleStartSession}
          onClose={() => {
            setIsSessionSettingsOpen(false);
          }}
        />
      )}

      {isSummaryOpen && summary !== null && (
        <SessionSummaryPopup
          elapsedTime={summary.elapsedTime}
          completedNaturally={summary.completedNaturally}
          wordCount={summary.wordCount}
          onClose={() => {
            setIsSummaryOpen(false);
          }}
          onStartAgain={handleStartAgain}
        />
      )}

      {session.status === 'paused' && (
        <SessionPausedPopup remainingTime={remainingTime} onResume={handleResumeSession} />
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
