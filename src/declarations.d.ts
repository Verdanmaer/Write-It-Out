declare global {
  interface Window {
    electronAPI: {
      onOpenEditorSettings: (callback: () => void) => () => void;

      onSessionStart: (callback: () => void) => () => void;
      onSessionPause: (callback: () => void) => () => void;
      onSessionResume: (callback: () => void) => () => void;
      onSessionStop: (callback: () => void) => () => void;
      setSessionStatus: (status: 'idle' | 'running' | 'paused' | 'finished') => void;

      loadEditorSettings: () => Promise<{
        fontSize: number;
        disappearanceSpeed: DisappearanceSpeed;
      }>;
      saveEditorSettings: (settings: {
        fontSize: number;
        disappearanceSpeed: DisappearanceSpeed;
      }) => Promise<void>;
    };
  }
}

export {};
