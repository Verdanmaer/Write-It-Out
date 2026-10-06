import { useEffect } from 'react';
import type { WritingSession } from './session';

interface UseSessionTimerProps {
  session: WritingSession;
  setSession: React.Dispatch<React.SetStateAction<WritingSession>>;
}

export function useSessionTimer({ session, setSession }: UseSessionTimerProps) {
  useEffect(() => {
    if (session.status !== 'running' || session.mode !== 'timed' || session.startedAt === null) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - session.startedAt!;
      const remaining = Math.max(0, (session.duration ?? 0) - elapsed);

      setSession((current) => ({
        ...current,
        remainingTime: remaining,
        status: remaining === 0 ? 'finished' : current.status,
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [session.status, session.mode, session.startedAt, session.duration, setSession]);
}
