import { formatDuration } from '../utils';

interface SessionPausedPopupProps {
  remainingTime: number;
  onResume: () => void;
}

export function SessionPausedPopup({ remainingTime, onResume }: SessionPausedPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-paused-title"
        className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-xl"
      >
        <h2 id="session-paused-title" className="text-lg font-medium">
          Session paused
        </h2>

        <p className="mt-2 text-sm text-neutral-500">Take a moment.</p>

        <div className="mt-6 rounded-lg bg-neutral-200 p-6 text-center">
          <p className="text-sm text-neutral-500">Time remaining</p>
          <p className="mt-1 text-3xl font-medium tabular-nums">
            {formatDuration(remainingTime, 'ceil')}
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            autoFocus
            onClick={onResume}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700"
          >
            Continue writing
          </button>
        </div>
      </section>
    </div>
  );
}
