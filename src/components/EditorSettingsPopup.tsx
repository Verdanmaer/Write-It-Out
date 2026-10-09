import type { DisappearanceSpeed, EditorSettings } from '../settings/editorSettings';

type EditorSettingsPopupProps = {
  settings: EditorSettings;
  onSettingsChange: (settings: EditorSettings) => void;
  onClose: () => void;
};

export function EditorSettingsPopup({
  settings,
  onSettingsChange,
  onClose,
}: EditorSettingsPopupProps) {
  function handleFontSizeChange(value: string) {
    const fontSize = Number(value);

    if (Number.isInteger(fontSize) && fontSize >= 12 && fontSize <= 32) {
      onSettingsChange({ ...settings, fontSize });
    }
  }

  function handleSpeedChange(value: DisappearanceSpeed) {
    onSettingsChange({ ...settings, disappearanceSpeed: value });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-settings-title"
        className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 text-gray-900 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="editor-settings-title" className="text-lg font-semibold">
            Editor Settings
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-md px-2 py-1 text-xl text-gray-500 hover:bg-gray-100"
          >
            &times;
          </button>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="font-size" className="text-sm font-medium">
              Font size
            </label>

            <div className="flex items-center gap-2">
              <input
                id="font-size"
                type="number"
                min={12}
                max={32}
                step={1}
                value={settings.fontSize}
                onChange={(event) => handleFontSizeChange(event.target.value)}
                className="w-20 rounded-md border border-gray-300 px-3 py-2 text-right outline-none focus:border-blue-500"
              />
              <span className="text-sm text-gray-500">px</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="disappearance-speed" className="text-sm font-medium">
              Disappearance speed
            </label>

            <select
              id="disappearance-speed"
              value={settings.disappearanceSpeed}
              onChange={(event) => handleSpeedChange(event.target.value as DisappearanceSpeed)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500"
            >
              <option value="slow">Slow</option>
              <option value="medium">Medium</option>
              <option value="fast">Fast</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Done
          </button>
        </div>
      </section>
    </div>
  );
}
