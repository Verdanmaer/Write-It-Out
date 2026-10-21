// oxlint-disable eslint-plugin-unicorn/no-empty-file
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  onOpenEditorSettings: (callback: () => void) => {
    const listener = () => callback();

    ipcRenderer.on('editor-settings:open', listener);

    return () => {
      ipcRenderer.removeListener('editor-settings:open', listener);
    };
  },

  loadEditorSettings: () => ipcRenderer.invoke('editor-settings:load'),

  saveEditorSettings: (settings: {
    fontSize: number;
    disappearanceSpeed: 'slow' | 'medium' | 'fast';
  }) => ipcRenderer.invoke('editor-settings:save', settings),

  onSessionStart: (callback: () => void) => {
    const listener = () => callback();

    ipcRenderer.on('session:start', listener);

    return () => {
      ipcRenderer.removeListener('session:start', listener);
    };
  },

  onSessionPause: (callback: () => void) => {
    const listener = () => callback();

    ipcRenderer.on('session:pause', listener);

    return () => {
      ipcRenderer.removeListener('session:pause', listener);
    };
  },

  onSessionResume: (callback: () => void) => {
    const listener = () => callback();

    ipcRenderer.on('session:resume', listener);

    return () => {
      ipcRenderer.removeListener('session:resume', listener);
    };
  },

  onSessionStop: (callback: () => void) => {
    const listener = () => callback();

    ipcRenderer.on('session:stop', listener);

    return () => {
      ipcRenderer.removeListener('session:stop', listener);
    };
  },

  setSessionStatus: (status: 'idle' | 'running' | 'paused' | 'finished') => {
    ipcRenderer.send('session:state-change', status);
  },
});
