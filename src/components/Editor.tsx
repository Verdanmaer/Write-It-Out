import { useEffect, useRef } from 'react';
import { useDisappearingText } from '../hooks/useDisappearingText';
import { DisappearanceSpeed, EditorSettings } from '../settings/editorSettings';

type EditorProps = {
  settings: EditorSettings;
  shouldFocus: boolean;
};

const disappearanceLifetimes = {
  [DisappearanceSpeed.SLOW]: 8000,
  [DisappearanceSpeed.MEDIUM]: 5000,
  [DisappearanceSpeed.FAST]: 3000,
};

export function Editor({ settings, shouldFocus }: EditorProps) {
  const { text, characters, handleChange, handleCursorChange } = useDisappearingText({
    lifetime: disappearanceLifetimes[settings.disappearanceSpeed],
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (shouldFocus === true) {
      textareaRef.current?.focus();
    }
  }, [shouldFocus]);

  const visualLayerRef = useRef<HTMLDivElement>(null);
  function handleScroll(event: React.UIEvent<HTMLTextAreaElement>) {
    const textarea = event.currentTarget;
    const visualLayer = visualLayerRef.current;

    if (visualLayer !== null) {
      visualLayer.style.transform = `translateY(-${textarea.scrollTop}px)`;
    }
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

  return (
    <div className="relative h-full w-full">
      <div
        className="pointer-events-none absolute inset-0 whitespace-pre-wrap p-8"
        style={{ fontSize: `${settings.fontSize}px` }}
        aria-hidden="true"
        ref={visualLayerRef}
      >
        {characters.map((character) => (
          <span
            key={character.id}
            className={`transition-opacity duration-500 ${
              character.expired === true ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {character.value}
          </span>
        ))}
      </div>

      <textarea
        className="absolute inset-0 h-full w-full resize-none bg-transparent p-8 text-transparent caret-black outline-none overflow-hidden"
        style={{ fontSize: `${settings.fontSize}px` }}
        value={text}
        ref={textareaRef}
        onChange={handleChange}
        onSelect={handleSelect}
        onClick={handleCursorChange}
        onKeyUp={handleCursorChange}
        onKeyDown={handleKeyDown}
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onScroll={handleScroll}
        placeholder="Start writing..."
        spellCheck={false}
        autoFocus
      />
    </div>
  );
}
