import { useEffect, useRef, useState } from 'react';
import { TextModel } from '../model/TextModel';

type UseDisappearingTextOptions = {
  lifetime: number;
};

const MAX_GRACE_PERIOD = 2000;
const DISTANCE_RADIUS = 40;

function createSnapshot(model: TextModel) {
  return {
    text: model.getText(),
    characters: model.getCharacters().map((character) => ({
      ...character,
    })),
  };
}

export function useDisappearingText({ lifetime }: UseDisappearingTextOptions) {
  const [model] = useState(() => new TextModel({ lifetime }));
  const [snapshot, setSnapshot] = useState(() => createSnapshot(model));
  const [cursorRevision, setCursorRevision] = useState(0);
  const cursorIndex = useRef(0);

  useEffect(() => {
    model.setLifetime(lifetime);
  }, [model, lifetime]);

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const newText = event.currentTarget.value;
    const oldText = model.getText();
    const selectionStart = event.currentTarget.selectionStart;
    cursorIndex.current = selectionStart;

    if (newText.length < oldText.length) {
      const deletedCharacters = oldText.length - newText.length;

      model.delete(selectionStart, deletedCharacters);
      setSnapshot(createSnapshot(model));

      return;
    }

    if (newText.length > oldText.length) {
      const insertedLength = newText.length - oldText.length;
      const insertionIndex = selectionStart - insertedLength;
      const insertedText = newText.slice(insertionIndex, selectionStart);

      model.insert(insertionIndex, insertedText);
      setSnapshot(createSnapshot(model));
    }
  }

  function handleCursorChange(event: React.SyntheticEvent<HTMLTextAreaElement>) {
    cursorIndex.current = event.currentTarget.selectionStart;
    setCursorRevision((revision) => revision + 1);
  }

  function clearText() {
    model.reset();
    cursorIndex.current = 0;
    setSnapshot(createSnapshot(model));
  }

  useEffect(() => {
    const characters = model.getCharacters();
    let nextExpiration = Number.POSITIVE_INFINITY;

    for (const [index, character] of characters.entries()) {
      if (character.expired === true) {
        continue;
      }

      const distance = Math.abs(index - cursorIndex.current);
      const proximity = Math.max(0, 1 - distance / DISTANCE_RADIUS);
      const gracePeriod = MAX_GRACE_PERIOD * proximity;
      const adjustedExpiresAt = character.expiresAt + gracePeriod;

      nextExpiration = Math.min(nextExpiration, adjustedExpiresAt);
    }

    if (nextExpiration === Number.POSITIVE_INFINITY) {
      return;
    }

    const timeout = setTimeout(
      () => {
        const now = Date.now();
        let hasChanges = false;

        for (const [index, character] of model.getCharacters().entries()) {
          if (character.expired === true) {
            continue;
          }

          const distance = Math.abs(index - cursorIndex.current);
          const proximity = Math.max(0, 1 - distance / DISTANCE_RADIUS);
          const gracePeriod = MAX_GRACE_PERIOD * proximity;
          const adjustedExpiresAt = character.expiresAt + gracePeriod;

          if (adjustedExpiresAt <= now) {
            model.expireCharacter(character.id);
            hasChanges = true;
          }
        }

        if (hasChanges === true) {
          setSnapshot(createSnapshot(model));
        } else {
          // Recalculate if the timeout fired slightly before its deadline.
          setCursorRevision((revision) => revision + 1);
        }
      },
      Math.max(0, nextExpiration - Date.now()),
    );

    return () => clearTimeout(timeout);
  }, [model, snapshot.characters, cursorRevision]);

  return {
    text: snapshot.text,
    characters: snapshot.characters,
    handleChange,
    handleCursorChange,
    clearText,
  };
}
