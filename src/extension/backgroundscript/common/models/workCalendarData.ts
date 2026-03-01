import { INTERNAL_ERROR_MSGS } from '../constants';
import Data from './workCalendarData_Data';

export default class WorkCalendarData {
    public constructor(public d: Data) {}

    public static fromObject(obj: object): WorkCalendarData {
        if (!('d' in obj) || !obj.d) {
            throw new Error(INTERNAL_ERROR_MSGS.UNABLE_TO_PARSE_OBJ);
        }
        return new WorkCalendarData(Data.fromObject(obj.d));
    }

    public toObject() {
        return {
            d: this.d.toObject(),
        };
    }
}
