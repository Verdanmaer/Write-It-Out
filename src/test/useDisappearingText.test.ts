import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDisappearingText } from '../hooks/useDisappearingText';

describe('useDisappearingText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(10000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should return empty text and characters', () => {
      const { result } = renderHook(() => useDisappearingText({ lifetime: 5000 }));

      expect(result.current.text).toBe('');
      expect(result.current.characters).toEqual([]);
    });
  });

  describe('insertion', () => {
    it('should insert text', () => {
      const { result } = renderHook(() => useDisappearingText({ lifetime: 5000 }));

      const textarea = document.createElement('textarea');
      textarea.value = 'Hello world';
      textarea.setSelectionRange(11, 11);

      act(() => {
        result.current.handleChange({
          currentTarget: textarea,
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      expect(result.current.text).toBe('Hello world');
      expect(result.current.characters).toHaveLength(11);
    });

    it('should insert text at the cursor position', () => {
      const { result } = renderHook(() => useDisappearingText({ lifetime: 5000 }));

      const textarea = document.createElement('textarea');
      textarea.value = 'Hello world';
      textarea.setSelectionRange(11, 11);

      act(() => {
        result.current.handleChange({
          currentTarget: textarea,
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      textarea.value = 'Hello beautiful world';
      textarea.setSelectionRange(16, 16);

      act(() => {
        result.current.handleChange({
          currentTarget: textarea,
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      expect(result.current.text).toBe('Hello beautiful world');
    });
  });

  describe('deletion', () => {
    it('should delete characters', () => {
      const { result } = renderHook(() => useDisappearingText({ lifetime: 5000 }));

      const textarea = document.createElement('textarea');
      textarea.value = 'Hello world';
      textarea.setSelectionRange(11, 11);

      act(() => {
        result.current.handleChange({
          currentTarget: textarea,
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      textarea.value = 'Hello worl';
      textarea.setSelectionRange(10, 10);

      act(() => {
        result.current.handleChange({
          currentTarget: textarea,
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      expect(result.current.text).toBe('Hello worl');
      expect(result.current.characters).toHaveLength(10);
    });
  });

  describe('expiration', () => {
    it('should expire characters after their lifetime', () => {
      const { result } = renderHook(() => useDisappearingText({ lifetime: 5000 }));

      const textarea = document.createElement('textarea');
      textarea.value = 'a'.repeat(41);
      textarea.setSelectionRange(41, 41);

      act(() => {
        result.current.handleChange({
          currentTarget: textarea,
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      expect(result.current.characters[0].expired).toBe(false);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.characters[0].expired).toBe(true);
    });

    it('should apply updated lifetime to newly inserted characters only', () => {
      const { result, rerender } = renderHook(({ lifetime }) => useDisappearingText({ lifetime }), {
        initialProps: { lifetime: 5000 },
      });

      const textarea = document.createElement('textarea');
      textarea.value = 'a';
      textarea.setSelectionRange(1, 1);

      act(() => {
        result.current.handleChange({
          currentTarget: textarea,
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      rerender({ lifetime: 10000 });

      textarea.value = 'ab';
      textarea.setSelectionRange(2, 2);

      act(() => {
        result.current.handleChange({
          currentTarget: textarea,
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      expect(result.current.characters[0].expiresAt).toBe(15000);
      expect(result.current.characters[1].expiresAt).toBe(20000);
    });

    it('should expire characters independently', () => {
      const { result } = renderHook(() => useDisappearingText({ lifetime: 5000 }));

      const textarea = document.createElement('textarea');
      textarea.value = 'a'.repeat(41);
      textarea.setSelectionRange(41, 41);

      act(() => {
        result.current.handleChange({
          currentTarget: textarea,
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      textarea.value = `${textarea.value}b`;
      textarea.setSelectionRange(42, 42);

      act(() => {
        result.current.handleChange({
          currentTarget: textarea,
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.characters[0].expired).toBe(true);
      expect(result.current.characters[41].expired).toBe(false);
    });

    it('should delay expiration when the cursor is nearby', () => {
      const { result } = renderHook(() => useDisappearingText({ lifetime: 5000 }));
      const textarea = document.createElement('textarea');

      textarea.value = 'a';
      textarea.setSelectionRange(1, 1);

      act(() => {
        result.current.handleChange({
          currentTarget: textarea,
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      expect(result.current.text).toBe('a');
      expect(result.current.characters).toHaveLength(1);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.characters[0].expired).toBe(false);

      act(() => {
        vi.advanceTimersByTime(1950);
      });

      expect(result.current.characters[0].expired).toBe(true);
    });

    it('should clear scheduled timeout on unmount', () => {
      const { result, unmount } = renderHook(() => useDisappearingText({ lifetime: 5000 }));

      const textarea = document.createElement('textarea');
      textarea.value = 'a';
      textarea.setSelectionRange(1, 1);

      act(() => {
        result.current.handleChange({
          currentTarget: textarea,
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('clearText', () => {
    it('should clear text and characters', () => {
      const { result } = renderHook(() => useDisappearingText({ lifetime: 5000 }));

      const textarea = document.createElement('textarea');
      textarea.value = 'Hello world';
      textarea.setSelectionRange(11, 11);

      act(() => {
        result.current.handleChange({
          currentTarget: textarea,
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      expect(result.current.text).toBe('Hello world');
      expect(result.current.characters).toHaveLength(11);

      act(() => {
        result.current.clearText();
      });

      expect(result.current.text).toBe('');
      expect(result.current.characters).toHaveLength(0);
    });
  });

  describe('deletion and expiration', () => {
    it('should update expiration scheduling after deleting characters', () => {
      const { result } = renderHook(() => useDisappearingText({ lifetime: 5000 }));

      const textarea = document.createElement('textarea');
      textarea.value = 'abc';
      textarea.setSelectionRange(3, 3);

      act(() => {
        result.current.handleChange({
          currentTarget: textarea,
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      expect(result.current.characters).toHaveLength(3);

      textarea.value = 'ab';
      textarea.setSelectionRange(2, 2);

      act(() => {
        result.current.handleChange({
          currentTarget: textarea,
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      expect(result.current.text).toBe('ab');
      expect(result.current.characters).toHaveLength(2);

      act(() => {
        vi.advanceTimersByTime(7000);
      });

      expect(result.current.characters[0].expired).toBe(true);
      expect(result.current.characters[1].expired).toBe(false);

      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(result.current.characters[1].expired).toBe(true);
    });
  });
});
