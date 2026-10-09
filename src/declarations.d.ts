declare global {
  interface Window {
    electronAPI: {
      onOpenEditorSettings: (callback: () => void) => () => void;
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
