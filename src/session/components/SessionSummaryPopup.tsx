import { formatDuration } from '../utils';

interface SessionSummaryPopupProps {
  elapsedTime: number;
  completedNaturally: boolean;
  wordCount: number;
  onClose: () => void;
  onStartAgain: () => void;
}

function calculateWordsPerMinute(wordCount: number, elapsedTime: number): number {
  if (elapsedTime <= 0) {
    return 0;
  }

  return Math.round(wordCount / (elapsedTime / 60000));
}

export function SessionSummaryPopup({
  elapsedTime,
  completedNaturally,
  wordCount,
  onClose,
  onStartAgain,
}: SessionSummaryPopupProps) {
  const wordsPerMinute = calculateWordsPerMinute(wordCount, elapsedTime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-summary-title"
        className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-xl"
      >
        <h2 id="session-summary-title" className="text-lg font-medium">
          {completedNaturally ? 'Session complete' : 'Session stopped'}
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          {completedNaturally
            ? 'Nice work. You made time to write.'
            : 'Your writing session has ended.'}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-neutral-200 p-4">
            <p className="text-sm text-neutral-500">Time</p>
            <p className="mt-1 text-2xl font-medium tabular-nums">
              {formatDuration(elapsedTime, 'floor')}
            </p>
          </div>

          <div className="rounded-lg bg-neutral-200 p-4">
            <p className="text-sm text-neutral-500">Words</p>
            <p className="mt-1 text-2xl font-medium tabular-nums">{wordCount}</p>
          </div>

          <div className="rounded-lg bg-neutral-200 p-4">
            <p className="text-sm text-neutral-500">Speed</p>
            <p className="mt-1 text-2xl font-medium tabular-nums">
              {wordsPerMinute} <span className="text-sm text-neutral-500">WPM</span>
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onStartAgain}
            className="rounded-lg bg-neutral-200 px-4 py-2 text-sm hover:bg-neutral-400"
          >
            Start again
          </button>

          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700"
          >
            Done
          </button>
        </div>
      </section>
    </div>
  );
}
