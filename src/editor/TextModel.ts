export type Character = {
  id: number;
  value: string;
  expiresAt: number;
  expired: boolean;
};

type TextModelOptions = {
  lifetime: number;
};

export class TextModel {
  private characters: Character[] = [];
  private nextId = 0;
  private lifetime: number;

  constructor(options: TextModelOptions) {
    this.lifetime = options.lifetime;
  }

  setLifetime(lifetime: number): void {
    this.lifetime = lifetime;
  }

  getText(): string {
    return this.characters.map((character) => character.value).join('');
  }

  getCharacters(): readonly Character[] {
    return this.characters;
  }

  getWordCount(): number {
    const trimmedText = this.getText().trim();

    if (trimmedText === '') {
      return 0;
    }

    return trimmedText.split(/\s+/).length;
  }

  insert(index: number, text: string): void {
    const insertedCharacters = Array.from(text).map((value) => ({
      id: this.nextId++,
      value,
      expiresAt: Date.now() + this.lifetime,
      expired: false,
    }));

    this.characters.splice(index, 0, ...insertedCharacters);
  }

  delete(index: number, count: number): void {
    this.characters.splice(index, count);
  }

  expireCharacter(id: number): void {
    const character = this.characters.find((item) => item.id === id);

    if (character !== undefined) {
      character.expired = true;
    }
  }

  reset(): void {
    this.characters = [];
    this.nextId = 0;
  }
}
