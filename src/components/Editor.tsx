import { useDisappearingText } from '../hooks/useDisappearingText';

export function Editor() {
  const { text, handleChange } = useDisappearingText({ lifetime: 5000 });

  return (
    <textarea
      className="h-full w-full resize-none bg-transparent p-8 text-lg outline-none"
      value={text}
      onChange={handleChange}
      placeholder="Start writing..."
      spellCheck={false}
      autoFocus
    />
  );
}
