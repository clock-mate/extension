import { INTERNAL_ERROR_MSGS } from '../constants';
import Metadata from './metadata';

export default class WorkCalendarData_Result {
    public constructor(
        public metadata: Metadata,
        public date: string,
        public targetHours: string,
    ) {}

    public static fromObject(obj: object): WorkCalendarData_Result {
        if (
            !('__metadata' in obj) ||
            !obj.__metadata ||
            !('Date' in obj) ||
            typeof obj.Date !== 'string' ||
            !('TargetHours' in obj) ||
            typeof obj.TargetHours !== 'string'
        ) {
            throw new Error(INTERNAL_ERROR_MSGS.UNABLE_TO_PARSE_OBJ);
        }
        return new WorkCalendarData_Result(
            Metadata.fromObject(obj.__metadata),
            obj.Date,
            obj.TargetHours,
        );
    }

    public toObject() {
        return {
            __metadata: this.metadata.toObject(),
            Date: this.date,
            TargetHours: this.targetHours,
        };
    }
}
