import { useEffect, useRef, useState } from 'react';

type Character = {
  id: number;
  value: string;
  expiresAt: number;
};

type UseDisappearingTextOptions = {
  lifetime: number;
};

export function useDisappearingText({ lifetime }: UseDisappearingTextOptions) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const nextId = useRef(0);

  const text = characters.map((character) => character.value).join('');

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const newText = event.target.value;

    if (newText.length < text.length) {
      const deletedCharacters = text.length - newText.length;

      setCharacters((current) => {
        const result = [...current];

        result.splice(event.target.selectionStart, deletedCharacters);

        return result;
      });

      return;
    }

    if (newText.length > text.length) {
      const insertionIndex = event.target.selectionStart - 1;
      const insertedText = newText.slice(
        insertionIndex,
        insertionIndex + (newText.length - text.length),
      );

      const newCharacters = [...characters];

      newCharacters.splice(
        insertionIndex,
        0,
        ...[...insertedText].map((value) => ({
          id: nextId.current++,
          value,
          expiresAt: Date.now() + lifetime,
        })),
      );

      setCharacters(newCharacters);

      return;
    }

    setCharacters(
      characters.map((character, index) => ({
        ...character,
        value: newText[index],
      })),
    );
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      setCharacters((current) => current.filter((character) => character.expiresAt > now));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return {
    text,
    handleChange,
  };
}
