import { INTERNAL_ERROR_MSGS } from '../constants';
import Metadata from './metadata';

export default class TimeData_Result {
    public constructor(
        public metadata: Metadata,
        public fieldName: string,
        public fieldValue: string,
    ) {}

    public static fromObject(obj: object): TimeData_Result {
        if (
            !('__metadata' in obj) ||
            !obj.__metadata ||
            !('FieldName' in obj) ||
            typeof obj.FieldName !== 'string' ||
            !('FieldValue' in obj) ||
            typeof obj.FieldValue !== 'string'
        ) {
            throw new Error(INTERNAL_ERROR_MSGS.UNABLE_TO_PARSE_OBJ);
        }
        return new TimeData_Result(
            Metadata.fromObject(obj.__metadata),
            obj.FieldName,
            obj.FieldValue,
        );
    }

    public toObject() {
        return {
            __metadata: this.metadata.toObject(),
            FieldName: this.fieldName,
            FieldValue: this.fieldValue,
        };
    }
}
