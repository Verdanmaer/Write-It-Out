import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  initialSession,
  startSession,
  pauseSession,
  resumeSession,
  stopSession,
  type WritingSession,
} from '../session/session';

describe('Session logic', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialSession', () => {
    it('should initialize a timed session in idle state', () => {
      expect(initialSession).toEqual({
        mode: 'timed',
        status: 'idle',
        duration: 60000,
        remainingTime: 60000,
        startedAt: null,
      });
    });
  });

  describe('startSession', () => {
    it('should start an idle session', () => {
      vi.spyOn(Date, 'now').mockReturnValue(10000);

      const session = startSession(initialSession);

      expect(session.status).toBe('running');
      expect(session.startedAt).toBe(10000);
      expect(session.remainingTime).toBe(60000);
    });

    it('should reset remaining time when starting a session', () => {
      vi.spyOn(Date, 'now').mockReturnValue(10000);

      const session: WritingSession = {
        ...initialSession,
        remainingTime: 20000,
      };

      const startedSession = startSession(session);

      expect(startedSession.remainingTime).toBe(60000);
    });

    it('should preserve the original session properties', () => {
      vi.spyOn(Date, 'now').mockReturnValue(10000);

      const session = startSession(initialSession);

      expect(session.mode).toBe(initialSession.mode);
      expect(session.duration).toBe(initialSession.duration);
    });

    it('should not modify the original session', () => {
      vi.spyOn(Date, 'now').mockReturnValue(10000);

      const originalSession = { ...initialSession };

      startSession(originalSession);

      expect(originalSession.status).toBe('idle');
      expect(originalSession.startedAt).toBeNull();
    });
  });

  describe('pauseSession', () => {
    it('should change session status to paused', () => {
      const runningSession: WritingSession = {
        ...initialSession,
        status: 'running',
        startedAt: 10000,
      };

      const session = pauseSession(runningSession);

      expect(session.status).toBe('paused');
    });

    it('should preserve remaining time when pausing', () => {
      const runningSession: WritingSession = {
        ...initialSession,
        status: 'running',
        remainingTime: 30000,
      };

      const session = pauseSession(runningSession);

      expect(session.remainingTime).toBe(30000);
    });
  });

  describe('resumeSession', () => {
    it('should change session status to running', () => {
      const pausedSession: WritingSession = {
        ...initialSession,
        status: 'paused',
      };

      const session = resumeSession(pausedSession);

      expect(session.status).toBe('running');
    });

    it('should preserve remaining time when resuming', () => {
      const pausedSession: WritingSession = {
        ...initialSession,
        status: 'paused',
        remainingTime: 30000,
      };

      const session = resumeSession(pausedSession);

      expect(session.remainingTime).toBe(30000);
    });
  });

  describe('stopSession', () => {
    it('should change session status to finished', () => {
      const runningSession: WritingSession = {
        ...initialSession,
        status: 'running',
      };

      const session = stopSession(runningSession);

      expect(session.status).toBe('finished');
    });

    it('should preserve remaining time when stopping', () => {
      const runningSession: WritingSession = {
        ...initialSession,
        status: 'running',
        remainingTime: 25000,
      };

      const session = stopSession(runningSession);

      expect(session.remainingTime).toBe(25000);
    });
  });
});
