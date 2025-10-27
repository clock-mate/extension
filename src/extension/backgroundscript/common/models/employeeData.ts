import { INTERNAL_ERROR_MSGS } from '../constants';
import Data from './employeeData_Data';

export default class EmployeeData {
    public constructor(public d: Data) {}

    public static fromObject(obj: object): EmployeeData {
        if (!('d' in obj) || !obj.d) {
            throw new Error(INTERNAL_ERROR_MSGS.UNABLE_TO_PARSE_OBJ);
        }
        return new EmployeeData(Data.fromObject(obj.d));
    }

    public toObject() {
        return {
            d: this.d.toObject(),
        };
    }
}
