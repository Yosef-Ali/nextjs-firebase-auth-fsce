import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: number | string | Date): string {
  if (!date) return '';
  
  let d: Date;
  
  if (typeof date === 'string') {
    // Handle ISO string or any other string format
    d = new Date(date);
  } else if (typeof date === 'number') {
    // Handle timestamp in milliseconds
    d = new Date(date);
  } else {
    // Handle Date object
    d = date;
  }

  // Check if date is valid
  if (isNaN(d.getTime())) {
    return '';
  }

  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}
