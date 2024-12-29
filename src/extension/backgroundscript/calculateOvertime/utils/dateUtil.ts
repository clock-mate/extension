export default class DateUtil {
    public static getMinutesBetween(date1: Date, date2: Date) {
        const diffInMs = Math.abs(date1.getTime() - date2.getTime());
        // convert milliseconds to seconds
        return diffInMs / (1000 * 60);
    }
}
