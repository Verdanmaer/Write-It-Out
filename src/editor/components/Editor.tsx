import { useEffect, useRef, useState } from 'react';
import type { SessionStatus } from '../../session/session';
import { useDisappearingText } from '../hooks/useDisappearingText';
import { CanvasRenderer } from '../rendering/CanvasRenderer';
import { DisappearanceSpeed, EditorSettings } from '../settings/editorSettings';

type EditorProps = {
  settings: EditorSettings;
  onRequestFocus: (focus: () => void) => void;
  sessionStatus: SessionStatus;
  onSessionFinished: (wordCount: number) => void;
};

const disappearanceLifetimes = {
  [DisappearanceSpeed.SLOW]: 8000,
  [DisappearanceSpeed.MEDIUM]: 5000,
  [DisappearanceSpeed.FAST]: 3000,
};

const EDITOR_PADDING = 32;
const FONT_FAMILY = 'sans-serif';

function countWords(text: string): number {
  const trimmedText = text.trim();

  if (trimmedText === '') {
    return 0;
  }

  return trimmedText.split(/\s+/).length;
}

export function Editor({
  settings,
  onRequestFocus,
  sessionStatus,
  onSessionFinished,
}: EditorProps) {
  const { text, characters, handleChange, handleCursorChange, clearText } = useDisappearingText({
    lifetime: disappearanceLifetimes[settings.disappearanceSpeed],
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const scrollTopRef = useRef(0);

  const [canvasSizeRevision, setCanvasSizeRevision] = useState(0);

  useEffect(() => {
    onRequestFocus(() => {
      textareaRef.current?.focus();
    });
  }, [onRequestFocus]);

  const previousStatus = useRef(sessionStatus);

  useEffect(() => {
    if (
      (previousStatus.current === 'idle' || previousStatus.current === 'finished') &&
      sessionStatus === 'running'
    ) {
      clearText();
    } else if (previousStatus.current !== 'finished' && sessionStatus === 'finished') {
      onSessionFinished(countWords(text));
      clearText();
    }

    previousStatus.current = sessionStatus;
  }, [sessionStatus, text, onSessionFinished, clearText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const textarea = textareaRef.current;

    if (canvas === null || textarea === null) {
      return;
    }

    const computedStyle = window.getComputedStyle(textarea);
    const computedLineHeight = Number.parseFloat(computedStyle.lineHeight);

    const renderer = new CanvasRenderer(canvas, {
      fontSize: settings.fontSize,
      fontFamily: computedStyle.fontFamily || FONT_FAMILY,
      padding: EDITOR_PADDING,
      lineHeight: Number.isNaN(computedLineHeight) ? settings.fontSize * 1.5 : computedLineHeight,
    });

    rendererRef.current = renderer;

    const resizeObserver = new ResizeObserver(() => {
      setCanvasSizeRevision((revision) => revision + 1);
    });

    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      rendererRef.current = null;
    };
  }, [settings.fontSize]);

  useEffect(() => {
    const renderer = rendererRef.current;
    const textarea = textareaRef.current;

    if (renderer === null || textarea === null) {
      return;
    }

    let animationFrameId = 0;

    const draw = () => {
      const currentRenderer = rendererRef.current;
      const currentTextarea = textareaRef.current;

      if (currentRenderer === null || currentTextarea === null) {
        return;
      }

      currentRenderer.render(characters, scrollTopRef.current);

      const hasFadingCharacters = characters.some(
        (character) =>
          character.fadeStartedAt !== null && performance.now() - character.fadeStartedAt < 500,
      );

      if (hasFadingCharacters === true) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [characters, canvasSizeRevision]);

  function handleScroll(event: React.UIEvent<HTMLTextAreaElement>) {
    const nextScrollTop = event.currentTarget.scrollTop;

    scrollTopRef.current = nextScrollTop;
  }

  function handleSelect(event: React.SyntheticEvent<HTMLTextAreaElement>) {
    const textarea = event.currentTarget;

    if (textarea.selectionStart !== textarea.selectionEnd) {
      textarea.setSelectionRange(textarea.selectionEnd, textarea.selectionEnd);
    }

    handleCursorChange(event);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    const isSelectionShortcut =
      (event.ctrlKey || event.metaKey) && ['a', 'c', 'x'].includes(event.key.toLowerCase());

    const isNavigationKey = [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'PageUp',
      'PageDown',
    ].includes(event.key);

    if (isSelectionShortcut || isNavigationKey) {
      event.preventDefault();
    }
  }

  function handleEditorChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    if (sessionStatus === 'paused') {
      return;
    }

    handleChange(event);
  }

  return (
    <div className="h-full w-full sm:px-16 sm:py-8 lg:px-32 lg:py-16 2xl:px-64 2xl:py-32">
      <div className="relative h-full w-full">
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        />

        <textarea
          className="absolute inset-8 resize-none bg-transparent text-transparent caret-transparent placeholder:text-gray-500 outline-none overflow-hidden"
          style={{
            fontSize: `${settings.fontSize}px`,
            fontFamily: FONT_FAMILY,
            lineHeight: `${settings.fontSize}px`,
          }}
          value={text}
          ref={textareaRef}
          onChange={handleEditorChange}
          onSelect={handleSelect}
          onClick={handleCursorChange}
          onKeyUp={handleCursorChange}
          onKeyDown={handleKeyDown}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onScroll={handleScroll}
          placeholder="Your thoughts start here..."
          spellCheck={false}
          autoFocus
          disabled={sessionStatus === 'paused'}
        />
      </div>
    </div>
  );
}
