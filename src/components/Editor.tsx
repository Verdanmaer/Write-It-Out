import { useState } from 'react';

export function Editor() {
  const [text, setText] = useState('');

  return (
    <textarea
      value={text}
      onChange={(event) => setText(event.target.value)}
      placeholder="Start writing..."
      spellCheck={false}
      autoFocus
      className="h-screen w-full resize-none border-0 bg-background p-2 text-lg outline-none"
    />
  );
}
