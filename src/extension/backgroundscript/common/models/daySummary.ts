import { INTERNAL_ERROR_MSGS } from '../constants';

/**
 * Holds the aggregated time summary for a single day, with all values in minutes.
 * `workedTime`, `absentTime` and `flexTime` are mutually exclusive.
 * `billableTime` is a subset of `workedTime`.
 */
export default class DaySummary {
    public constructor(
        /** Minutes of regular work (non-absent) */
        public workedTime: number,
        /** Minutes of absence (e.g. holidays) */
        public absentTime: number,
        /** Minutes of flex time taken */
        public flexTime: number,
        /** Minutes of billable work — a subset of workedTime */
        public billableTime: number,
    ) {}

    public static fromJSON(obj: object): DaySummary {
        if (
            !('workedTime' in obj) ||
            typeof obj.workedTime !== 'number' ||
            !('absentTime' in obj) ||
            typeof obj.absentTime !== 'number' ||
            !('flexTime' in obj) ||
            typeof obj.flexTime !== 'number' ||
            !('billableTime' in obj) ||
            typeof obj.billableTime !== 'number'
        ) {
            throw new Error(INTERNAL_ERROR_MSGS.UNABLE_TO_PARSE_OBJ);
        }
        return new DaySummary(obj.workedTime, obj.absentTime, obj.flexTime, obj.billableTime);
    }

    public toJSON() {
        return {
            workedTime: this.workedTime,
            absentTime: this.absentTime,
            flexTime: this.flexTime,
            billableTime: this.billableTime,
        };
    }
}
