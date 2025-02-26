import { Timestamp } from 'firebase/firestore';

/**
 * Converts various date formats to a JavaScript Date object
 * @param value - Date, number (milliseconds), or Firebase Timestamp
 * @returns JavaScript Date object
 * @throws {TypeError} If input is not a valid date format
 */
export function toDate(value: Date | number | Timestamp): Date {
    try {
        if (typeof value === 'number') {
            if (isNaN(value)) {
                throw new TypeError('Invalid timestamp number');
            }
            return new Date(value);
        }

        if (value instanceof Timestamp) {
            return value.toDate();
        }

        if (value instanceof Date) {
            return value;
        }

        throw new TypeError('Invalid date format');
    } catch (error) {
        console.error('Error converting to date:', error);
        throw error;
    }
}
