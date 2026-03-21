import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(date));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data:image/xxx;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

export function getMediaType(file: File): string {
  const type = file.type;
  if (type.startsWith('image/')) return type;
  // Fallback based on extension
  const ext = file.name.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', heic: 'image/heic',
  };
  return map[ext || ''] || 'image/jpeg';
}

export function levelToDescription(level: number): string {
  const levels: Record<number, string> = {
    1: 'Black', 2: 'Darkest Brown', 3: 'Dark Brown',
    4: 'Medium Brown', 5: 'Light Brown', 6: 'Dark Blonde',
    7: 'Medium Blonde', 8: 'Light Blonde', 9: 'Very Light Blonde',
    10: 'Lightest Blonde/Platinum',
  };
  return levels[level] || `Level ${level}`;
}

export function difficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    beginner: 'text-emerald-600 bg-emerald-50',
    intermediate: 'text-amber-600 bg-amber-50',
    advanced: 'text-rose-600 bg-rose-50',
  };
  return colors[difficulty] || 'text-stone bg-sand';
}
