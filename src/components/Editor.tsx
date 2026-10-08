import { useDisappearingText } from '../hooks/useDisappearingText';
import { DisappearanceSpeed, EditorSettings } from '../settings/editorSettings';

type EditorProps = {
  settings: EditorSettings;
};

const disappearanceLifetimes = {
  [DisappearanceSpeed.SLOW]: 8000,
  [DisappearanceSpeed.MEDIUM]: 5000,
  [DisappearanceSpeed.FAST]: 3000,
};

export function Editor({ settings }: EditorProps) {
  const { text, characters, handleChange } = useDisappearingText({
    lifetime: disappearanceLifetimes[settings.disappearanceSpeed],
  });

  return (
    <div className="relative h-full w-full">
      <div
        className="pointer-events-none absolute inset-0 whitespace-pre-wrap p-8"
        style={{ fontSize: `${settings.fontSize}px` }}
        aria-hidden="true"
      >
        {characters.map((character) => (
          <span
            key={character.id}
            className={`transition-opacity duration-500 ${
              character.expired ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {character.value}
          </span>
        ))}
      </div>

      <textarea
        className="absolute inset-0 h-full w-full resize-none bg-transparent p-8 text-transparent caret-black outline-none"
        style={{ fontSize: `${settings.fontSize}px` }}
        value={text}
        onChange={handleChange}
        placeholder="Start writing..."
        spellCheck={false}
        autoFocus
      />
    </div>
  );
}
