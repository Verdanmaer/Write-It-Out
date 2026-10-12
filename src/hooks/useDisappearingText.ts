import { useEffect, useRef, useState } from 'react';

type Character = {
  id: number;
  value: string;
  expiresAt: number;
  expired: boolean;
};

type UseDisappearingTextOptions = {
  lifetime: number;
};

const MAX_GRACE_PERIOD = 2000;
const DISTANCE_RADIUS = 40;

export function useDisappearingText({ lifetime }: UseDisappearingTextOptions) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const nextId = useRef(0);
  const cursorIndex = useRef(0);

  const text = characters.map((character) => character.value).join('');

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const newText = event.target.value;

    cursorIndex.current = event.target.selectionStart;

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
          expired: false,
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

  function handleCursorChange(event: React.SyntheticEvent<HTMLTextAreaElement>) {
    cursorIndex.current = event.currentTarget.selectionStart;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      setCharacters((current) =>
        current.map((character, index) => {
          if (character.expired === true) {
            return character;
          }

          const distance = Math.abs(index - cursorIndex.current);
          const proximity = Math.max(0, 1 - distance / DISTANCE_RADIUS);
          const gracePeriod = MAX_GRACE_PERIOD * proximity;
          const adjustedExpiresAt = character.expiresAt + gracePeriod;

          if (adjustedExpiresAt <= now) {
            return {
              ...character,
              expired: true,
            };
          }

          return character;
        }),
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return {
    text,
    characters,
    handleChange,
    handleCursorChange,
  };
}
