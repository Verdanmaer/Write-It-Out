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
});
