import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Editor } from './components/Editor';
import './index.css';
import { initialSession, type WritingSession } from './session/session';
import { useSessionTimer } from './session/useSessionTimer';
import { EditorSettings, initialEditorSettings } from './settings/editorSettings';

export function App() {
  const [session, setSession] = useState<WritingSession>(initialSession);
  const remainingTime = useSessionTimer({ session, setSession });
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(initialEditorSettings);

  return (
    <main className="h-screen">
      <Editor settings={editorSettings} />
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
