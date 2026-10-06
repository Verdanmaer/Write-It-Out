import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Editor } from './components/Editor';
import './index.css';
import { useState } from 'react';
import { initialSession, type WritingSession } from './session/session';
import { useSessionTimer } from './session/useSessionTimer';

export function App() {
  const [session, setSession] = useState<WritingSession>(initialSession);
  useSessionTimer({ session, setSession });

  return (
    <main className="h-screen">
      <Editor />
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
