export const formatDuration = (duration: string | number): string => {
  if (duration === 'LIVE') return 'LIVE';

  // Handle string "MM:SS"
  if (typeof duration === 'string') return duration;

  // Handle number (milliseconds)
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  const hoursStr = (hours < 10) ? "0" + hours : hours;
  const minutesStr = (minutes < 10) ? "0" + minutes : minutes;
  const secondsStr = (seconds < 10) ? "0" + seconds : seconds;

  if (hours > 0) {
      return `${hoursStr}:${minutesStr}:${secondsStr}`;
  }
  return `${minutesStr}:${secondsStr}`;
};
