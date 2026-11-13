import type { Character } from '../model/TextModel';

interface CanvasRendererOptions {
  fontSize: number;
  fontFamily: string;
  padding: number;
  lineHeight: number;
}

const FADE_DURATION = 500;

export class CanvasRenderer {
  private context: CanvasRenderingContext2D;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private options: CanvasRendererOptions,
  ) {
    const context = canvas.getContext('2d');

    if (context === null) {
      throw new Error('Unable to initialize the Canvas 2D context.');
    }

    this.context = context;
  }

  updateOptions(options: CanvasRendererOptions): void {
    this.options = options;
  }

  render(characters: readonly Character[], scrollTop: number): void {
    const { fontSize, padding, lineHeight } = this.options;
    const { canvas } = this;
    const context = this.context;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const pixelRatio = window.devicePixelRatio || 1;

    if (width === 0 || height === 0) {
      return;
    }

    if (
      canvas.width !== Math.round(width * pixelRatio) ||
      canvas.height !== Math.round(height * pixelRatio)
    ) {
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
    }

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.font = `${fontSize}px ${this.options.fontFamily}`;
    context.textBaseline = 'top';
    context.fillStyle = '#000000';

    const availableWidth = Math.max(1, width - padding * 2);
    const rightEdge = padding + availableWidth;

    let x = padding;
    let y = padding;
    let index = 0;

    while (index < characters.length) {
      const character = characters[index];

      if (character.value === '\n') {
        x = padding;
        y += lineHeight;
        index += 1;
        continue;
      }

      const isWhitespace = /^\s+$/.test(character.value);
      let endIndex = index + 1;

      if (isWhitespace === false) {
        while (
          endIndex < characters.length &&
          characters[endIndex].value !== '\n' &&
          /^\s+$/.test(characters[endIndex].value) === false
        ) {
          endIndex += 1;
        }
      }

      const word = characters
        .slice(index, endIndex)
        .map((item) => item.value)
        .join('');

      const wordWidth = context.measureText(word).width;
      if (isWhitespace === false && x + wordWidth > rightEdge && x > padding) {
        x = padding;
        y += lineHeight;
      }

      for (let wordIndex = index; wordIndex < endIndex; wordIndex += 1) {
        const wordCharacter = characters[wordIndex];
        const characterWidth =
          wordCharacter.value === '\t'
            ? context.measureText('    ').width
            : context.measureText(wordCharacter.value).width;

        if (isWhitespace === false && x + characterWidth > rightEdge && x > padding) {
          x = padding;
          y += lineHeight;
        }

        if (wordCharacter.value === '\t') {
          x += characterWidth;
          continue;
        }

        if (wordCharacter.expired === false) {
          context.globalAlpha = 1;
          context.fillText(wordCharacter.value, x, y - scrollTop);
        } else if (wordCharacter.fadeStartedAt !== null) {
          const elapsed = performance.now() - wordCharacter.fadeStartedAt;
          const opacity = Math.max(0, 1 - elapsed / FADE_DURATION);

          if (opacity > 0) {
            context.globalAlpha = opacity;
            context.fillText(wordCharacter.value, x, y - scrollTop);
          }
        }

        context.globalAlpha = 1;
        x += characterWidth;
      }

      index = endIndex;
    }
  }
}
