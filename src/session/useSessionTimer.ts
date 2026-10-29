import { useEffect, useRef } from 'react';
import type { WritingSession } from './session';

interface UseSessionTimerProps {
  session: WritingSession;
  setSession: React.Dispatch<React.SetStateAction<WritingSession>>;
}

export function useSessionTimer({ session, setSession }: UseSessionTimerProps) {
  const lastTick = useRef<number | null>(null);

  useEffect(() => {
    if (session.status !== 'running' || session.mode !== 'timed') {
      lastTick.current = null;
      return;
    }

    lastTick.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - (lastTick.current ?? now);

      lastTick.current = now;

      setSession((current) => {
        const remainingTime = Math.max(0, (current.remainingTime ?? 0) - elapsed);

        if (remainingTime === 0) {
          return {
            ...current,
            remainingTime: 0,
            status: 'finished',
          };
        }

        return {
          ...current,
          remainingTime,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [session.status, session.mode, setSession]);

  return session.remainingTime ?? 0;
}
