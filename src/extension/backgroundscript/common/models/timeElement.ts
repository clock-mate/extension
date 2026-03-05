import { INTERNAL_ERROR_MSGS } from '../constants';

/**
 * This model allows a much easier calculation of overtimes by only providing the necessary attributes
 * in a nice format.
 */
export default class TimeElement {
    /**
     * Creates a new instance of a TimeElement. The `endTime` has to be after the
     * `startTime`.
     * @throws if the `startTime` is after the `endTime` or the same; if times are longer then HHMMSS format
     */
    public constructor(
        /** The start time of this entry in HHMMSS format */
        public startTime: string,
        /** The end time of this entry in HHMMSS format */
        public endTime: string,
        /** The type of attendance which indicates if this is a holiday, overtime, normal work, etc. entry */
        public attendanceType: number,
        /** Typically 1 or 2 for billable or not, also 5 for travel time */
        public calculationMotive: number,
    ) {
        if (startTime >= endTime) {
            throw new Error(
                `Invalid startTime and endTime parameter. endTime "${endTime}" has to be after startTime "${startTime}"`,
            );
        }
        if (startTime.length > 6 || endTime.length > 6) {
            throw new Error(
                `Invalid time format. startTime and endTime have to be in HHMMSS format. Received startTime "${startTime}" and endTime "${endTime}"`,
            );
        }
        this.attendanceType = Number(attendanceType);
    }

    public static fromObject(obj: object): TimeElement {
        if (
            !('startTime' in obj) ||
            typeof obj.startTime !== 'string' ||
            !('endTime' in obj) ||
            typeof obj.endTime !== 'string' ||
            !('attendanceType' in obj) ||
            typeof obj.attendanceType !== 'number' ||
            !('calculationMotive' in obj) ||
            typeof obj.calculationMotive !== 'number'
        ) {
            throw new Error(INTERNAL_ERROR_MSGS.UNABLE_TO_PARSE_OBJ);
        }
        return new TimeElement(
            obj.startTime,
            obj.endTime,
            obj.attendanceType,
            obj.calculationMotive,
        );
    }

    public toObject() {
        return {
            startTime: this.startTime,
            endTime: this.endTime,
            attendanceType: this.attendanceType,
            calculationMotive: this.calculationMotive,
        };
    }
}
