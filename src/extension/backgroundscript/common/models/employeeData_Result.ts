import { INTERNAL_ERROR_MSGS } from '../constants';
import Metadata from './metadata';

export default class EmployeeData_Result {
    public constructor(
        public metadata: Metadata,
        public employeeId: string,
    ) {}

    public static fromObject(obj: object): EmployeeData_Result {
        if (
            !('__metadata' in obj) ||
            !obj.__metadata ||
            !('EmployeeId' in obj) ||
            typeof obj.EmployeeId !== 'string'
        ) {
            throw new Error(INTERNAL_ERROR_MSGS.UNABLE_TO_PARSE_OBJ);
        }

        return new EmployeeData_Result(Metadata.fromObject(obj.__metadata), obj.EmployeeId);
    }

    public toObject() {
        return {
            __metadata: this.metadata.toObject(),
            EmployeeId: this.employeeId,
        };
    }
}
