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
}
