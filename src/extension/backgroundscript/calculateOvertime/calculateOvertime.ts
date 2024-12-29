import TimeElement from '../common/models/timeElement';
import { SimplePublicHoliday } from '../common/types/publicHoliday';
import DateUtil from './utils/dateUtil';

export default class CalculateOvertime {
    private static readonly FLEXDAY_ATTENDANCE_TYPE: 9003;


    /** The days which are considered holidays */
    publicHolidays: SimplePublicHoliday[];

    /**
     * @param publicHolidays the days which are considered holidays
     */
    public constructor(publicHolidays: SimplePublicHoliday[]) {
        this.publicHolidays = publicHolidays;
    }

    // ===== Overtime calculation =====
    /**
     * Calculates the overtime in minutes. The calculation does expect normal working days to be from Monday
     * to Friday. Working on holidays will only be calculated correctly if the holidays are set in the constructor.
     * @param timeElements               all elements to calculate the overtime from, expected to be sorted by date
     * @param minutesPerWeek             the expected amount of minutes to work in a week (default: `40 * 60`)
     * @param previousOvertimeMinutes    will be added to the calculated overtime (default: `0`)
     * @returns the overtime in minutes
     */
    public calculateOvertime(
        timeElements: TimeElement[][],
        minutesPerWeek = 40 * 60,
        previousOvertimeMinutes = 0,
    ): number {
        let overtimeMinutes = 0;
        const expectedMinutesPerDay = minutesPerWeek / 5;

        timeElements.forEach((dayTimeElements: TimeElement[]) => {
            overtimeMinutes += this.calculateOvertimePerDay(dayTimeElements, expectedMinutesPerDay);
        });

        return overtimeMinutes + previousOvertimeMinutes;
    }

    /**
     * Calculates the overtime for the given TimeElements on a day. This can be a negative
     * or positiv number in minutes depending on the `attendanceType`s of the TimeElements.
     * Expects normal working days to be from Monday to Friday.
     * @param timeElements     the TimeElements for the day to calcualte
     * @param minutesPerDay    the expected minutes to work per day
     * @returns the overtime for the day in minutes
     */
    private calculateOvertimePerDay(timeElements: TimeElement[], minutesPerDay: number): number {
        let overtimeMinutes = 0;

        timeElements.forEach((timeElement) => {
            const minutes = DateUtil.getMinutesBetween(timeElement.startDate, timeElement.endDate);
            if (timeElement.attendanceType === CalculateOvertime.FLEXDAY_ATTENDANCE_TYPE) {
                // flexday entries should be ignored since these are not actual working times
                return;
            }

            overtimeMinutes += minutes;
        });

        // subtract the expected minutes per day
        const weekDay = timeElements[0].startDate.getDay();
        if (weekDay === 0 || weekDay === 6) {
            // on Sundays or Saturdays don't subtract the minutes per day
            return overtimeMinutes;
        }
        overtimeMinutes -= minutesPerDay;

        return this.adjustOvertimeForPublicHoliday(
            timeElements[0].startDate,
            overtimeMinutes,
            minutesPerDay,
        );
    }

    /**
     * Adjusts the overtime for the day to respect holidays. Which days are holidays
     * is set in the constructor.
     * @param day                the day to check for a holiday
     * @param overtimeMinutes    the overtime for the day in minutes
     * @param minutesPerDay      the expected minutes to work per day
     * @returns the adjusted overtime for the day in minutes
     */
    private adjustOvertimeForPublicHoliday(
        day: Date,
        overtimeMinutes: number,
        minutesPerDay: number,
    ): number {
        this.publicHolidays.forEach((publicHoliday: SimplePublicHoliday) => {
            if (day.getDate() === publicHoliday.day && day.getMonth() === publicHoliday.month) {
                // the given day is a holiday
                overtimeMinutes += publicHoliday.freeTimeFactor * minutesPerDay;
            }
        });
        return overtimeMinutes;
    }
}