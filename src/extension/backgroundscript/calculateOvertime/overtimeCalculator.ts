import DaySummary from '../common/models/daySummary';
import TimeElement from '../common/models/timeElement';
import DateUtil from './utils/dateUtil';

/** Attendance types that count as absence rather than worked time. */
const ABSENT_ATTENDANCE_TYPES: number[] = [9001, 9003];

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
             * Fiori will return 0 planned minutes for days which are a fully vacation or overtime day.
             * In that case the calculation would be negative and we take 0 for actually planned minutes.
             * For half vacation/overtime days fiori will return the planned minutes of a full work day,
             * in that case we calculate the remaining planned minutes ourselves.
             */
            const actuallyPlannedMinutes = Math.max(0, planned - daySummary.absentTime);
            const dayOvertime = daySummary.workedTime - actuallyPlannedMinutes;

            overtimeMinutes += dayOvertime;
        }

        return overtimeMinutes + previousOvertimeMinutes;
    }

    /**
     * Aggregates raw time elements into a per-day summary of worked, absent and billable minutes.
     * @param timeElements  map of YYYYMMDD with time elements for that day
     * @returns map of YYYYMMDD with {@link DaySummary} or null if unplausible calculation
     */
    public aggregateDailySummaries(timeElements: Record<string, TimeElement[]>): Record<string, DaySummary> | null {
        const result: Record<string, DaySummary> = {};

        for (const [dateKey, dayElements] of Object.entries(timeElements)) {
            let workedTime = 0;
            let absentTime = 0;
            let billableTime = 0;

            for (const timeElement of dayElements) {
                const duration = DateUtil.getMinutesBetween(timeElement.startTime, timeElement.endTime);
                if (ABSENT_ATTENDANCE_TYPES.includes(timeElement.attendanceType)) {
                    absentTime += duration;
                } else {
                    workedTime += duration;
                    if (timeElement.calculationMotive === BILLABLE_CALCULATION_MOTIVE) {
                        billableTime += duration;
                    }
                }
            }

            if (workedTime < 0 || absentTime < 0 || (workedTime + absentTime) > MAX_MINUTES_PER_DAY) {
                // Safety check, should not happen with valid data
                return null;
            }
            result[dateKey] = new DaySummary(workedTime, absentTime, billableTime);
        }

        return result;
    }
}
