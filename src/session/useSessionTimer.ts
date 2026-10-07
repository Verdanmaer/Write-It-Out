import { useEffect, useRef, useState } from 'react';
import type { WritingSession } from './session';

interface UseSessionTimerProps {
  session: WritingSession;
  setSession: React.Dispatch<React.SetStateAction<WritingSession>>;
}

export function useSessionTimer({ session, setSession }: UseSessionTimerProps) {
  const [remainingTime, setRemainingTime] = useState(session.duration ?? 0);
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

      setRemainingTime((time) => Math.max(0, time - elapsed));
    }, 100);

    return () => clearInterval(interval);
  }, [session.status, session.mode]);

  return remainingTime;
}
