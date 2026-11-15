import { clsx, type ClassValue } from 'clsx';

/**
 * Merges class names cleanly using clsx.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Formats byte counts into human-readable strings (e.g. 50.4 KB, 1.2 MB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeIndex = Math.min(i, sizes.length - 1);
  const value = parseFloat((bytes / Math.pow(k, safeIndex)).toFixed(dm));

  return `${value} ${sizes[safeIndex]}`;
}
