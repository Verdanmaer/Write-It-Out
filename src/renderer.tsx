import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Editor } from './components/Editor';
import './index.css';

export function App() {
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
    <App />
  </StrictMode>,
);
