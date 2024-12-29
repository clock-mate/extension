export default class Formater {
    
    /**
     * Formats the given minutes into a human readable string of hours and minutes.
     * For example 80 -> 1h 20min
     * @param minutes can be positive or negative
     * @returns the formatted time string
     */
    public static minutesToTimeString(minutes: number): string {
        const remainingMinutes = Math.abs(minutes) % 60;
        const wholeHours = (Math.abs(minutes) - remainingMinutes) / 60;

        let result = minutes < 0 ? '-' : '';
        if (wholeHours > 0) {
            result += wholeHours + 'h';
            if (remainingMinutes > 0) {
                result += ' ';
            } else {
                return result;
            }
        }
        return result + remainingMinutes + 'min';
    }

    /**
     * Takes a string which will be converted into a number. The string maybe an empty or whitespace only
     * string then 0 will be returned. The string may use `,` or `.` as a decimal point.
     * @returns the number or 0
     * @throws if the input is not a number
     */
    public static getNumberFromString(input: string): number {
        if (input.trim().length == 0) {
            return 0;
        }
        // remove any spaces in the string (allow space between "-" and number)
        const number = Number(input.replace(/\s+/g, '').replace(',', '.'));
        if (Number.isNaN(number)) {
            throw new Error(
                'Invalid input string which does not represent a number. Received: ' + input,
            );
        }
        return number;
    }

    /**
     * Takes the hours and calculates the minutes rounded to the nearest 5 min.
     * @param hours the hours to convert, may be floating point, e.g.: 1.57
     * @returns integer minutes, e.g.: 95
    */
    public static roundHoursToNearest5Minutes(hours: number): number {
        const minutes = hours * 60;
        return Math.round(minutes / 5) * 5;
    }
}