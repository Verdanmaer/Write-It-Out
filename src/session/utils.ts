export function formatDuration(milliseconds: number, rounding: 'ceil' | 'floor' = 'floor'): string {
  const totalSeconds =
    rounding === 'ceil' ? Math.ceil(milliseconds / 1000) : Math.floor(milliseconds / 1000);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
