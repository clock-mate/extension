export default class Formater {
    /**
     * Takes the given date and returns the date in the format YYYYMMDD. The method uses local time since
     * the date created is in local time and the day should therefore also be determined with local time!
     * @param date    the date to be formatted
     * @returns the formatted date string
     */
    public static formatDateToYYYYMMDD(date: Date): string {
        // 0 indexed month to normal number, add leading 0 if necessary
        const month = String(date.getMonth() + 1).padStart(2, '0');

        // add leading 0 if necessary
        const day = String(date.getDate()).padStart(2, '0');

        return `${date.getFullYear()}${month}${day}`;
    }
}