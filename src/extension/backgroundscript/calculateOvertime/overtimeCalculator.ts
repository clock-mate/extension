import { HalfPublicHolidaysConfig } from '../../common/types/settingsData';
import TimeElement from '../common/models/timeElement';
import DateUtil from './utils/dateUtil';

export default class overtimeCalculator {
    private static readonly FLEXDAY_ATTENDANCE_TYPE = 9003;
    private static readonly HALF_PUBLIC_HOLIDAY_FREE_TIME_FACTOR = 0.5;

    // ===== Overtime calculation =====
    /**
     * Calculates the overtime in minutes. The calculation does expect normal working days to be from Monday
     * to Friday. Working on holidays will only be calculated for holidays accounted for in `HalfPublicHolidaysConfig`.
     * @param timeElements               all elements to calculate the overtime from, expected to be sorted by date
     * @param halfHolidayConfig          configuration of half public holidays
     * @param minutesPerWeek             the expected amount of minutes to work in a week (default: `40 * 60`)
     * @param previousOvertimeMinutes    will be added to the calculated overtime (default: `0`)
     * @returns the overtime in minutes
     */
    public calculateOvertime(
        timeElements: TimeElement[][],
        halfHolidayConfig: HalfPublicHolidaysConfig,
        minutesPerWeek = 40 * 60,
        previousOvertimeMinutes = 0,
    ): number {
        let overtimeMinutes = 0;
        const expectedMinutesPerDay = minutesPerWeek / 5;

        timeElements.forEach((dayTimeElements: TimeElement[]) => {
            overtimeMinutes += this.calculateOvertimePerDay(
                dayTimeElements,
                expectedMinutesPerDay,
                halfHolidayConfig,
            );
        });

        return overtimeMinutes + previousOvertimeMinutes;
    }

    /**
     * Calculates the overtime for the given TimeElements on a day. This can be a negative
     * or positive number in minutes depending on the `attendanceType`s of the TimeElements.
     * Expects normal working days to be from Monday to Friday.
     * @param timeElements      the TimeElements for the day to calcualte
     * @param minutesPerDay     the expected minutes to work per day
     * @param halfHolidayConfig configuration of half public holidays
     * @returns the overtime for the day in minutes
     */
    private calculateOvertimePerDay(
        timeElements: TimeElement[],
        minutesPerDay: number,
        halfHolidayConfig: HalfPublicHolidaysConfig,
    ): number {
        let overtimeMinutes = 0;

        timeElements.forEach((timeElement) => {
            const minutes = DateUtil.getMinutesBetween(timeElement.startDate, timeElement.endDate);
            if (timeElement.attendanceType === overtimeCalculator.FLEXDAY_ATTENDANCE_TYPE) {
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

        return this.adjustOvertimeForHalfHoliday(
            timeElements[0].startDate,
            overtimeMinutes,
            minutesPerDay,
            halfHolidayConfig,
        );
    }

    /**
     * Adjusts the overtime for the day to respect half holidays.
     * @param day                the day to check for a holiday
     * @param overtimeMinutes    the overtime for the day in minutes
     * @param minutesPerDay      the expected minutes to work per day
     * @param halfHolidayConfig  configuration of half public holidays
     * @returns the adjusted overtime for the day in minutes
     */
    private adjustOvertimeForHalfHoliday(
        day: Date,
        overtimeMinutes: number,
        minutesPerDay: number,
        halfHolidayConfig: HalfPublicHolidaysConfig,
    ): number {
        const adjustForHalfHoliday = (minutes: number) => {
            return (
                minutes + overtimeCalculator.HALF_PUBLIC_HOLIDAY_FREE_TIME_FACTOR * minutesPerDay
            );
        };

        if (!halfHolidayConfig.enabled) {
            return overtimeMinutes;
        }
        if (halfHolidayConfig.dec24 && day.getDate() == 24 && day.getMonth() == 11) {
            overtimeMinutes = adjustForHalfHoliday(overtimeMinutes);
        } else if (halfHolidayConfig.dec31 && day.getDate() == 31 && day.getMonth() == 11) {
            overtimeMinutes = adjustForHalfHoliday(overtimeMinutes);
        }
        return overtimeMinutes;
    }
}
