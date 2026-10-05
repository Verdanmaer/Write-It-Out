import { useDisappearingText } from '../hooks/useDisappearingText';

export function Editor() {
  const { text, characters, handleChange } = useDisappearingText({ lifetime: 5000 });

  return (
    <div className="relative h-full w-full">
      <div
        className="pointer-events-none absolute inset-0 whitespace-pre-wrap p-8 text-lg"
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
        className="absolute inset-0 h-full w-full resize-none bg-transparent p-8 text-lg text-transparent caret-black outline-none"
        value={text}
        onChange={handleChange}
        placeholder="Start writing..."
        spellCheck={false}
        autoFocus
      />
    </div>
  );
}
