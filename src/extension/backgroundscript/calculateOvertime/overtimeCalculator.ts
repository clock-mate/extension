import DaySummary from '../common/models/daySummary';
import TimeElement from '../common/models/timeElement';
import DateUtil from './utils/dateUtil';

/** Attendance types that count as absence rather than worked time. */
const ABSENT_ATTENDANCE_TYPES: number[] = [
    9001, // vaction
    9005, // absent
];
const FLEX_DAY_ATTENDANCE_TYPE = 9003;

const BILLABLE_CALCULATION_MOTIVE = 1;

const MAX_MINUTES_PER_DAY = 24 * 60;

export default class OvertimeCalculator {
    /**
     * Calculates the overtime in minutes by comparing worked time elements against the planned
     * minutes per day. Absent entries are excluded from the worked time calculation.
     * @param daySummaries           map of YYYYMMDD with day summaries for that day
     * @param plannedMinutesPerDay   map of YYYYMMDD with planned minutes
     * @param previousOvertimeMinutes  will be added to the calculated overtime (default: `0`)
     * @returns the overtime in minutes
     */
    public calculateOvertime(
        daySummaries: Record<string, DaySummary>,
        plannedMinutesPerDay: Record<string, number>,
        previousOvertimeMinutes = 0,
    ): number {
        let overtimeMinutes = 0;

        // only use entries with entered time
        for (const [dateKey, daySummary] of Object.entries(daySummaries)) {
            const planned = plannedMinutesPerDay[dateKey] ?? 0;

            /**
             * Fiori will subtract absent time from the planned time. For overtime calculation this means
             * we can just ignore absent time since it is already taken care of.
             */
            let dayOvertime = daySummary.workedTime - planned;
            dayOvertime -= daySummary.flexTime; // Flex time reduces overtime

            overtimeMinutes += dayOvertime;
        }

        return overtimeMinutes + previousOvertimeMinutes;
    }

    /**
     * Aggregates raw time elements into a per-day summary of worked, absent and billable minutes.
     * @param timeElements  map of YYYYMMDD with time elements for that day
     * @returns map of YYYYMMDD with {@link DaySummary} or null if unplausible calculation
     */
    public aggregateDailySummaries(
        timeElements: Record<string, TimeElement[]>,
    ): Record<string, DaySummary> | null {
        const result: Record<string, DaySummary> = {};

        for (const [dateKey, dayElements] of Object.entries(timeElements)) {
            let workedTime = 0;
            let absentTime = 0;
            let flexTime = 0;
            let billableTime = 0;

            for (const timeElement of dayElements) {
                const duration = DateUtil.getMinutesBetween(
                    timeElement.startTime,
                    timeElement.endTime,
                );
                if (ABSENT_ATTENDANCE_TYPES.includes(timeElement.attendanceType)) {
                    absentTime += duration;
                } else if (timeElement.attendanceType === FLEX_DAY_ATTENDANCE_TYPE) {
                    flexTime += duration;
                } else {
                    workedTime += duration;
                    if (timeElement.calculationMotive === BILLABLE_CALCULATION_MOTIVE) {
                        billableTime += duration;
                    }
                }
            }

            if (
                workedTime < 0 ||
                absentTime < 0 ||
                flexTime < 0 ||
                workedTime + absentTime + flexTime > MAX_MINUTES_PER_DAY
            ) {
                // Safety check, should not happen with valid data
                return null;
            }
            result[dateKey] = new DaySummary(workedTime, absentTime, flexTime, billableTime);
        }

        return result;
    }
}
