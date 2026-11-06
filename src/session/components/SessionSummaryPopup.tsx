interface SessionSummaryPopupProps {
  elapsedTime: number;
  completedNaturally: boolean;
  wordCount: number;
  onClose: () => void;
}

function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function SessionSummaryPopup({
  elapsedTime,
  completedNaturally,
  wordCount,
  onClose,
}: SessionSummaryPopupProps) {
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

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-neutral-100 p-4">
            <p className="text-sm text-neutral-500">Time spent</p>
            <p className="mt-1 text-2xl font-medium tabular-nums">{formatDuration(elapsedTime)}</p>
          </div>

          <div className="rounded-lg bg-neutral-100 p-4">
            <p className="text-sm text-neutral-500">Words written</p>
            <p className="mt-1 text-2xl font-medium tabular-nums">{wordCount}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
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
