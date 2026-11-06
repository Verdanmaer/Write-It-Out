export enum DisappearanceSpeed {
  SLOW = 'slow',
  MEDIUM = 'medium',
  FAST = 'fast',
}

export type EditorSettings = {
  fontSize: number;
  disappearanceSpeed: DisappearanceSpeed;
};

export const initialEditorSettings: EditorSettings = {
  fontSize: 18,
  disappearanceSpeed: DisappearanceSpeed.MEDIUM,
};
