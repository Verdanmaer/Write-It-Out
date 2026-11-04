import { useState } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WritingSession } from '../session/session';
import { useSessionTimer } from '../session/useSessionTimer';

function useSessionHarness(initialSession: WritingSession) {
  const [session, setSession] = useState(initialSession);
  const remainingTime = useSessionTimer({ session, setSession });

  return { session, remainingTime, setSession };
}

function createSession(overrides: Partial<WritingSession> = {}): WritingSession {
  return {
    mode: 'timed',
    status: 'running',
    duration: 5000,
    remainingTime: 5000,
    startedAt: Date.now(),
    ...overrides,
  };
}

describe('useSessionTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('decreases remaining time while a timed session is running', () => {
    const { result } = renderHook(() => useSessionHarness(createSession()));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.remainingTime).toBe(4000);
    expect(result.current.session.status).toBe('running');
  });

  it('does not decrease remaining time while paused', () => {
    const { result } = renderHook(() => useSessionHarness(createSession({ status: 'paused' })));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.remainingTime).toBe(5000);
  });

  it('continues the countdown after resuming a session', () => {
    const { result } = renderHook(() => useSessionHarness(createSession({ status: 'paused' })));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.setSession((current) => ({
        ...current,
        status: 'running',
      }));
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.remainingTime).toBe(4000);
  });

  it('finishes the session when the remaining time reaches zero', () => {
    const { result } = renderHook(() =>
      useSessionHarness(
        createSession({
          duration: 250,
          remainingTime: 250,
        }),
      ),
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.remainingTime).toBe(0);
    expect(result.current.session.status).toBe('finished');
  });

  it('does not decrease remaining time in free writing mode', () => {
    const { result } = renderHook(() =>
      useSessionHarness(
        createSession({
          mode: 'free',
          duration: null,
          remainingTime: null,
        }),
      ),
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.remainingTime).toBe(0);
    expect(result.current.session.status).toBe('running');
  });

  it('cleans up the interval when the session is paused', () => {
    const { result } = renderHook(() => useSessionHarness(createSession()));

    expect(vi.getTimerCount()).toBe(1);

    act(() => {
      result.current.setSession((current) => ({
        ...current,
        status: 'paused',
      }));
    });

    expect(vi.getTimerCount()).toBe(0);
  });

  it('cleans up the interval when the hook unmounts', () => {
    const { unmount } = renderHook(() => useSessionHarness(createSession()));

    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
