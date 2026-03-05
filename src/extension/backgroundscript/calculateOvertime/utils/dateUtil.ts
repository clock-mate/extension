export default class DateUtil {
    /**
     * Calculates the number of minutes between two times given in HHMMSS format
     * rounded to the nearest minute.
     * @param time1 in HHMMSS format
     * @param time2 in HHMMSS format
     */
    public static getMinutesBetween(time1: string, time2: string): number {
        const toMinutes = (time: string) =>
            Number(time.substring(0, 2)) * 60 +
            Number(time.substring(2, 4)) +
            Number(time.substring(4, 6)) / 60;
        return Math.round(Math.abs(toMinutes(time2) - toMinutes(time1)));
    }
}
