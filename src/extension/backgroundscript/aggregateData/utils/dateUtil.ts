export default class DateUtil {
    public static getDateFromYYYYMMDD(date: string): Date {
        return new Date(`${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`);
    }

    /**
     * Gets a Datetime object from the provided date and time.
     * @param date    the date or more precise the day to use
     * @param time    the time in the format HHMMSS
     */
    public static getDateFromDateAndTime(date: Date, time: string): Date {
        return new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            Number(time.substring(0, 2)),
            Number(time.substring(2, 4)),
            Number(time.substring(4)),
        );
    }

    /**
     * Checks whether or not the provided Date objects reference the same day while
     * ignoring the time.
     * @returns true if both Date objects reference the same day
     */
    public static isSameDay(date1: Date, date2: Date) {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }
}
