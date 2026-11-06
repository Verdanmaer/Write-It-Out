import { afterEach, describe, expect, it, vi } from 'vitest';
import { CanvasRenderer } from '../editor/rendering/CanvasRenderer';
import type { Character } from '../editor/model/TextModel';

function createCharacter(id: number, value: string, overrides: Partial<Character> = {}): Character {
  return {
    id,
    value,
    expiresAt: 10000,
    expired: false,
    fadeStartedAt: null,
    ...overrides,
  };
}

function createRenderer(width = 200, height = 100) {
  const canvas = document.createElement('canvas');

  Object.defineProperty(canvas, 'clientWidth', {
    configurable: true,
    value: width,
  });

  Object.defineProperty(canvas, 'clientHeight', {
    configurable: true,
    value: height,
  });

  const alphaValues: number[] = [];

  const context = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    measureText: vi.fn((text: string) => ({
      width: text.length * 10,
    })),
    fillText: vi.fn(),
    font: '',
    textBaseline: '',
    fillStyle: '',
    globalAlpha: 1,
  };

  context.fillText.mockImplementation(() => {
    alphaValues.push(context.globalAlpha);
  });

  Object.defineProperty(canvas, 'getContext', {
    configurable: true,
    value: vi.fn().mockReturnValue(context),
  });

  const renderer = new CanvasRenderer(canvas, {
    fontSize: 16,
    fontFamily: 'Arial',
    padding: 10,
    lineHeight: 20,
  });

  return { canvas, context, renderer, alphaValues };
}

describe('CanvasRenderer', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws an error when the canvas context cannot be initialized', () => {
    const canvas = document.createElement('canvas');

    Object.defineProperty(canvas, 'getContext', {
      configurable: true,
      value: vi.fn().mockReturnValue(null),
    });

    expect(() => {
      new CanvasRenderer(canvas, {
        fontSize: 16,
        fontFamily: 'Arial',
        padding: 10,
        lineHeight: 20,
      });
    }).toThrow('Unable to initialize the Canvas 2D context.');
  });

  it('does not render when the canvas has zero width or height', () => {
    const { canvas, context, renderer } = createRenderer(0, 100);

    renderer.render([], 0, 0);

    expect(context.clearRect).not.toHaveBeenCalled();
    expect(context.fillText).not.toHaveBeenCalled();
    expect(canvas.width).toBe(300);
    expect(canvas.height).toBe(150);
  });

  it('resizes the canvas and configures the rendering context', () => {
    const { canvas, context, renderer } = createRenderer(200, 100);

    renderer.render([], 0, 0);

    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(100);
    expect(context.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 200, 100);

    expect(context.font).toBe('16px Arial');
    expect(context.textBaseline).toBe('top');
    expect(context.fillStyle).toBe('#000000');
  });

  it('renders characters at their calculated positions', () => {
    const { context, renderer } = createRenderer();
    const characters = [createCharacter(0, 'H'), createCharacter(1, 'i')];

    renderer.render(characters, 2, 0);

    expect(context.fillText).toHaveBeenCalledTimes(2);
    expect(context.fillText).toHaveBeenNthCalledWith(1, 'H', 10, 10);
    expect(context.fillText).toHaveBeenNthCalledWith(2, 'i', 20, 10);
  });

  it('moves characters to a new line after an explicit newline', () => {
    const { context, renderer } = createRenderer();
    const characters = [createCharacter(0, 'A'), createCharacter(1, '\n'), createCharacter(2, 'B')];

    renderer.render(characters, 3, 0);

    expect(context.fillText).toHaveBeenCalledTimes(2);
    expect(context.fillText).toHaveBeenNthCalledWith(1, 'A', 10, 10);
    expect(context.fillText).toHaveBeenNthCalledWith(2, 'B', 10, 30);
  });

  it('wraps a word onto the next line when it does not fit', () => {
    const { context, renderer } = createRenderer(60, 100);
    const characters = Array.from('abc de').map((value, index) => createCharacter(index, value));

    renderer.render(characters, characters.length, 0);

    expect(context.fillText).toHaveBeenCalledWith('a', 10, 10);
    expect(context.fillText).toHaveBeenCalledWith('c', 30, 10);
    expect(context.fillText).toHaveBeenCalledWith(' ', 40, 10);
    expect(context.fillText).toHaveBeenCalledWith('d', 10, 30);
    expect(context.fillText).toHaveBeenCalledWith('e', 20, 30);
  });

  it('adjusts the vertical drawing position according to scrollTop', () => {
    const { context, renderer } = createRenderer();
    const characters = [createCharacter(0, 'A')];

    renderer.render(characters, 1, 15);

    expect(context.fillText).toHaveBeenCalledWith('A', 10, -5);
  });

  it('advances the cursor position for tabs without drawing the tab character', () => {
    const { context, renderer } = createRenderer();
    const characters = [createCharacter(0, 'A'), createCharacter(1, '\t'), createCharacter(2, 'B')];

    renderer.render(characters, 3, 0);

    expect(context.fillText).toHaveBeenCalledTimes(2);
    expect(context.fillText).toHaveBeenNthCalledWith(1, 'A', 10, 10);
    expect(context.fillText).toHaveBeenNthCalledWith(2, 'B', 60, 10);
  });

  it('draws an expired character with reduced opacity during its fade', () => {
    const { context, renderer, alphaValues } = createRenderer();
    const characters = [
      createCharacter(0, 'A', {
        expired: true,
        fadeStartedAt: 0,
      }),
    ];

    vi.spyOn(performance, 'now').mockReturnValue(250);
    renderer.render(characters, 1, 0);

    expect(context.fillText).toHaveBeenCalledWith('A', 10, 10);
    expect(alphaValues).toEqual([0.5]);
  });

  it('does not draw an expired character after its fade duration', () => {
    const { context, renderer } = createRenderer();
    const characters = [
      createCharacter(0, 'A', {
        expired: true,
        fadeStartedAt: 0,
      }),
    ];

    vi.spyOn(performance, 'now').mockReturnValue(500);
    renderer.render(characters, 1, 0);

    expect(context.fillText).not.toHaveBeenCalled();
  });

  it('does not draw an expired character without a fade start time', () => {
    const { context, renderer } = createRenderer();
    const characters = [
      createCharacter(0, 'A', {
        expired: true,
        fadeStartedAt: null,
      }),
    ];

    renderer.render(characters, 1, 0);

    expect(context.fillText).not.toHaveBeenCalled();
  });

  it('draws non-expired characters with full opacity', () => {
    const { renderer, alphaValues } = createRenderer();
    const characters = [createCharacter(0, 'A'), createCharacter(1, 'B')];

    renderer.render(characters, 2, 0);

    expect(alphaValues).toEqual([1, 1]);
  });

  it('uses device pixel ratio when resizing the canvas', () => {
    const { canvas, context, renderer } = createRenderer(200, 100);

    vi.spyOn(window, 'devicePixelRatio', 'get').mockReturnValue(2);
    renderer.render([], 0, 0);

    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(200);
    expect(context.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
  });

  it('does not resize the canvas when its dimensions are already correct', () => {
    const { canvas, renderer } = createRenderer(200, 100);
    canvas.width = 200;
    canvas.height = 100;

    const widthSetter = vi.spyOn(HTMLCanvasElement.prototype, 'width', 'set');
    const heightSetter = vi.spyOn(HTMLCanvasElement.prototype, 'height', 'set');
    renderer.render([], 0, 0);

    expect(widthSetter).not.toHaveBeenCalled();
    expect(heightSetter).not.toHaveBeenCalled();
  });

  it('uses updated options when rendering', () => {
    const { context, renderer } = createRenderer();

    renderer.updateOptions({
      fontSize: 20,
      fontFamily: 'Monospace',
      padding: 20,
      lineHeight: 30,
    });

    renderer.render([createCharacter(0, 'A')], 1, 0);

    expect(context.font).toBe('20px Monospace');
    expect(context.fillText).toHaveBeenCalledWith('A', 20, 20);
  });
});
