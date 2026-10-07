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
  mode: 'timed',
  status: 'idle',
  duration: 60000,
  remainingTime: 60000,
  startedAt: null,
};

export function startSession(session: WritingSession): WritingSession {
  return {
    ...session,
    status: 'running',
    startedAt: Date.now(),
    remainingTime: session.duration,
  };
}

export function pauseSession(session: WritingSession): WritingSession {
  return {
    ...session,
    status: 'paused',
  };
}

export function resumeSession(session: WritingSession): WritingSession {
  return {
    ...session,
    status: 'running',
  };
}

export function stopSession(session: WritingSession): WritingSession {
  return {
    ...session,
    status: 'finished',
  };
}
