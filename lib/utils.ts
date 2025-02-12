import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Timestamp } from "firebase/firestore"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: number | string | Date | Timestamp | null | undefined): string {
  if (!input) return '';

  let date: Date;

  try {
    if (input instanceof Timestamp) {
      date = input.toDate();
    } else if (input instanceof Date) {
      date = input;
    } else if (typeof input === 'number') {
      date = new Date(input);
    } else if (typeof input === 'string') {
      date = new Date(input);
    } else {
      return '';
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}
