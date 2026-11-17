import { formatDuration } from '../utils';

type FloatingTimerProps = {
  remainingTime: number | null;
};

export function FloatingTimer({ remainingTime }: FloatingTimerProps) {
  if (remainingTime === null) {
    return null;
  }

  return (
    <div
      className="group fixed right-6 top-6 z-50 select-none"
      onMouseDown={(event) => event.preventDefault()}
    >
      <div className="flex min-h-8 min-w-8 items-center justify-center">
        <div className="size-3 rounded-full bg-neutral-300 transition-opacity duration-200 group-hover:opacity-0" />

        <div className="pointer-events-none absolute cursor-default rounded-full bg-background/90 px-3 py-1 text-xs text-muted-foreground opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
          {formatDuration(remainingTime, 'ceil')}
        </div>
      </div>
    </div>
  );
}
