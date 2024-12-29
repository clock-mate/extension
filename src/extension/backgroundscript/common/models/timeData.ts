import { INTERNAL_ERROR_MSGS } from '../constants';
import Data from './timeData_Data';

export default class TimeData {
    public constructor(public d: Data) {}

    public static fromObject(obj: object): TimeData {
        if (!('d' in obj) || !obj.d) {
            throw new Error(INTERNAL_ERROR_MSGS.UNABLE_TO_PARSE_OBJ);
        }
        return new TimeData(Data.fromObject(obj.d));
    }

    public toObject() {
        return {
            d: this.d.toObject(),
        };
    }
}
