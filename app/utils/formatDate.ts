import { Timestamp } from 'firebase/firestore';
import { toClientDate } from '@/lib/timestamp';

interface FormatDateOptions extends Intl.DateTimeFormatOptions {
    locale?: string;
}

const DEFAULT_OPTIONS: FormatDateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
};

/**
 * Formats a date, timestamp, or Firebase Timestamp to a human-readable string
 * @param date - DateLike value (Date, number in milliseconds, or Firebase Timestamp)
 * @param options - Intl.DateTimeFormatOptions with optional locale (defaults to en-US)
 * @returns Formatted date string or 'Invalid Date' if conversion fails
 */
export function formatDate(
    date: Date | number | Timestamp | undefined | null,
    options: FormatDateOptions = DEFAULT_OPTIONS
): string {
    try {
        if (!date) return 'N/A';
        const convertedDate = toClientDate(date);
        return new Intl.DateTimeFormat(options.locale || 'en-US', options).format(convertedDate);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
}
