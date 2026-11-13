export type DisappearanceSpeed = 'slow' | 'medium' | 'fast';

export interface EditorSettings {
  fontSize: number;
  disappearanceSpeed: DisappearanceSpeed;
}

export const initialEditorSettings: EditorSettings = {
  fontSize: 18,
  disappearanceSpeed: 'medium',
};
