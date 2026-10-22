import { useState } from 'react';

interface SessionSettingsPopupProps {
  onStart: (durationMs: number) => void;
  onClose: () => void;
}

const presets = [5, 10, 15];

export function SessionSettingsPopup({ onStart, onClose }: SessionSettingsPopupProps) {
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [useCustomDuration, setUseCustomDuration] = useState(false);
  const [customDuration, setCustomDuration] = useState('20');

  const duration = useCustomDuration ? Number(customDuration) : selectedDuration;

  const isValidDuration = Number.isInteger(duration) && duration >= 1 && duration <= 120;

  const handleStart = () => {
    if (isValidDuration) {
      onStart(duration * 60_000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-settings-title"
        className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-xl"
      >
        <h2 id="session-settings-title" className="text-lg font-medium">
          Start a writing session
        </h2>

        <p className="mt-2 text-sm text-neutral-500">Choose how long you want to write.</p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {presets.map((minutes) => (
            <button
              key={minutes}
              type="button"
              aria-pressed={useCustomDuration === false && selectedDuration === minutes}
              onClick={() => {
                setSelectedDuration(minutes);
                setUseCustomDuration(false);
              }}
              className={`rounded-lg border px-3 py-3 text-sm transition-colors ${
                useCustomDuration === false && selectedDuration === minutes
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              {minutes} min
            </button>
          ))}
        </div>

        <div className="mt-4">
          <button
            type="button"
            aria-pressed={useCustomDuration}
            onClick={() => setUseCustomDuration(true)}
            className={`text-sm underline underline-offset-4 ${
              useCustomDuration ? 'font-medium' : 'text-neutral-500'
            }`}
          >
            Custom duration
          </button>

          {useCustomDuration && (
            <div className="mt-3">
              <label htmlFor="custom-session-duration" className="mb-1 block text-sm">
                Minutes (1–120)
              </label>

              <input
                id="custom-session-duration"
                type="number"
                min={1}
                max={120}
                step={1}
                value={customDuration}
                onChange={(event) => setCustomDuration(event.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
              />

              {isValidDuration === false && (
                <p className="mt-1 text-sm text-red-600">Enter a whole number between 1 and 120.</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm hover:bg-neutral-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleStart}
            disabled={isValidDuration === false}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start session
          </button>
        </div>
      </section>
    </div>
  );
}
