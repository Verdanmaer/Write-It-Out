declare global {
  interface Window {
    electronAPI: {
      onOpenEditorSettings: (callback: () => void) => () => void;
    };
  }
}

export {};
