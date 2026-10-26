import type { Character } from './TextModel';

type CanvasRendererOptions = {
  fontSize: number;
  fontFamily: string;
  padding: number;
  lineHeight: number;
};

type CharacterPosition = {
  x: number;
  y: number;
};

const FADE_DURATION = 500;

export class CanvasRenderer {
  private context: CanvasRenderingContext2D;
  private positions = new Map<number, CharacterPosition>();

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

  render(characters: readonly Character[], cursorIndex: number, scrollTop: number): void {
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

    this.positions.clear();

    const availableWidth = Math.max(1, width - padding * 2);
    let x = padding;
    let y = padding;
    let cursorPosition: CharacterPosition = { x, y };

    for (let index = 0; index < characters.length; index += 1) {
      const character = characters[index];

      this.positions.set(character.id, { x, y });

      if (index === cursorIndex) {
        cursorPosition = { x, y };
      }

      if (character.value === '\n') {
        x = padding;
        y += lineHeight;
        continue;
      }

      const characterWidth = context.measureText(character.value).width;

      if (x + characterWidth > padding + availableWidth && x > padding) {
        x = padding;
        y += lineHeight;

        this.positions.set(character.id, { x, y });

        if (index === cursorIndex) {
          cursorPosition = { x, y };
        }
      }

      if (character.expired === false) {
        context.globalAlpha = 1;
        context.fillText(character.value, x, y - scrollTop);
      } else if (character.fadeStartedAt !== null) {
        const elapsed = performance.now() - character.fadeStartedAt;
        const opacity = Math.max(0, 1 - elapsed / FADE_DURATION);

        if (opacity > 0) {
          context.globalAlpha = opacity;
          context.fillText(character.value, x, y - scrollTop);
        }
      }

      context.globalAlpha = 1;

      x += characterWidth;
    }

    if (cursorIndex >= characters.length) {
      cursorPosition = { x, y };
    }

    void cursorPosition;
  }
}
