export type SessionMode = 'free' | 'timed';

export type SessionStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface WritingSession {
  mode: SessionMode;
  status: SessionStatus;
  duration: number | null;
  remainingTime: number | null;
  startedAt: number | null;
}

export const initialSession: WritingSession = {
  mode: 'free',
  status: 'idle',
  duration: null,
  remainingTime: null,
  startedAt: null,
};
