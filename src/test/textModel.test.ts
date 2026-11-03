import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TextModel } from '../editor/TextModel';

describe('TextModel', () => {
  let model: TextModel;

  beforeEach(() => {
    model = new TextModel({ lifetime: 5000 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getText', () => {
    it('should return an empty string initially', () => {
      expect(model.getText()).toBe('');
    });

    it('should return all characters in the correct order', () => {
      model.insert(0, 'Hello world');

      expect(model.getText()).toBe('Hello world');
    });
  });

  describe('getWordCount', () => {
    it('should return 0 for empty text', () => {
      expect(model.getWordCount()).toBe(0);
    });

    it('should return 0 for whitespace-only text', () => {
      model.insert(0, '   \n\t  ');

      expect(model.getWordCount()).toBe(0);
    });

    it('should count words separated by spaces', () => {
      model.insert(0, 'Hello world from Write-It-Out');

      expect(model.getWordCount()).toBe(4);
    });

    it('should handle multiple consecutive spaces', () => {
      model.insert(0, 'Hello    world');

      expect(model.getWordCount()).toBe(2);
    });

    it('should handle newlines and tabs', () => {
      model.insert(0, 'Hello\nworld\tagain');

      expect(model.getWordCount()).toBe(3);
    });

    it('should ignore leading and trailing whitespace', () => {
      model.insert(0, '  Hello world  ');

      expect(model.getWordCount()).toBe(2);
    });
  });

  describe('insert', () => {
    it('should insert text into an empty model', () => {
      model.insert(0, 'Hello');

      expect(model.getText()).toBe('Hello');
    });

    it('should insert text at the specified index', () => {
      model.insert(0, 'Hello world');
      model.insert(6, 'beautiful ');

      expect(model.getText()).toBe('Hello beautiful world');
    });

    it('should insert text at the beginning', () => {
      model.insert(0, 'world');
      model.insert(0, 'Hello ');

      expect(model.getText()).toBe('Hello world');
    });

    it('should insert text at the end', () => {
      model.insert(0, 'Hello');
      model.insert(5, ' world');

      expect(model.getText()).toBe('Hello world');
    });

    it('should assign unique sequential IDs', () => {
      model.insert(0, 'abc');

      const characters = model.getCharacters();

      expect(characters.map((character) => character.id)).toEqual([0, 1, 2]);
    });

    it('should assign new IDs when inserting between existing characters', () => {
      model.insert(0, 'ac');
      model.insert(1, 'b');

      const characters = model.getCharacters();

      expect(characters.map((character) => character.id)).toEqual([0, 2, 1]);
    });

    it('should set the correct expiration timestamp', () => {
      vi.spyOn(Date, 'now').mockReturnValue(10000);

      model.insert(0, 'ab');

      expect(model.getCharacters().map((character) => character.expiresAt)).toEqual([15000, 15000]);
    });

    it('should initialize characters as not expired', () => {
      model.insert(0, 'abc');

      expect(model.getCharacters().every((character) => character.expired === false)).toBe(true);
    });

    it('should handle Unicode characters', () => {
      model.insert(0, 'A😀é');

      expect(model.getText()).toBe('A😀é');
      expect(model.getCharacters()).toHaveLength(3);
    });

    it('should do nothing when inserting an empty string', () => {
      model.insert(0, '');

      expect(model.getText()).toBe('');
      expect(model.getCharacters()).toHaveLength(0);
    });
  });

  describe('setLifetime', () => {
    it('should use the updated lifetime for subsequently inserted characters', () => {
      vi.spyOn(Date, 'now').mockReturnValue(10000);

      model.insert(0, 'a');
      model.setLifetime(2000);
      model.insert(1, 'b');

      const characters = model.getCharacters();

      expect(characters[0].expiresAt).toBe(15000);
      expect(characters[1].expiresAt).toBe(12000);
    });
  });

  describe('delete', () => {
    it('should delete characters at the specified index', () => {
      model.insert(0, 'Hello world');
      model.delete(5, 1);

      expect(model.getText()).toBe('Helloworld');
    });

    it('should delete multiple characters', () => {
      model.insert(0, 'Hello world');
      model.delete(5, 6);

      expect(model.getText()).toBe('Hello');
    });

    it('should handle deleting zero characters', () => {
      model.insert(0, 'Hello');
      model.delete(2, 0);

      expect(model.getText()).toBe('Hello');
    });

    it('should handle deleting beyond the end of the text', () => {
      model.insert(0, 'Hello');
      model.delete(3, 100);

      expect(model.getText()).toBe('Hel');
    });
  });

  describe('expireCharacter', () => {
    it('should mark the specified character as expired', () => {
      model.insert(0, 'abc');
      vi.spyOn(performance, 'now').mockReturnValue(1234);

      model.expireCharacter(1);

      const character = model.getCharacters()[1];

      expect(character.expired).toBe(true);
      expect(character.fadeStartedAt).toBe(1234);
    });

    it('should do nothing for an unknown character ID', () => {
      model.insert(0, 'abc');
      const charactersBefore = model.getCharacters().map((character) => ({
        ...character,
      }));

      model.expireCharacter(999);

      expect(model.getCharacters()).toEqual(charactersBefore);
    });

    it('should not expire an already expired character again', () => {
      model.insert(0, 'a');

      const performanceNow = vi
        .spyOn(performance, 'now')
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(200);

      model.expireCharacter(0);
      model.expireCharacter(0);

      expect(model.getCharacters()[0].fadeStartedAt).toBe(100);
      expect(performanceNow).toHaveBeenCalledTimes(1);
    });
  });

  describe('reset', () => {
    it('should remove all characters', () => {
      model.insert(0, 'Hello world');
      model.reset();

      expect(model.getText()).toBe('');
      expect(model.getCharacters()).toHaveLength(0);
    });

    it('should reset character IDs', () => {
      model.insert(0, 'abc');
      model.reset();
      model.insert(0, 'xy');

      expect(model.getCharacters().map((character) => character.id)).toEqual([0, 1]);
    });
  });
});
