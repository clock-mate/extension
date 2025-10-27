import TimeData from '../common/models/timeData';
import TimeData_Result from '../common/models/timeData_Result';
import TimeElement from '../common/models/timeElement';
import DateUtil from './utils/dateUtil';

export default class TimeSheetAggregator {
    /** The inner arrays represent days. The TimeElements in the inner arrays have the
     * same starting day.*/
    timeElements: TimeElement[][];

    constructor() {
        this.timeElements = [];
    }

    public parseTimeDataToTimeElements(timeData: TimeData): TimeElement[][] {
        const results: TimeData_Result[] = timeData.d.results;

        let date: string;
        let startTime: string;
        let endTime: string;
        let attendanceType: string;

        results.forEach((dataElement) => {
            // temporarily save the necessary information
            switch (dataElement.fieldName) {
                case 'WORKDATE':
                    date = dataElement.fieldValue;
                    break;
                case 'AWART':
                    attendanceType = dataElement.fieldValue;
                    break;
                case 'STARTTIME':
                    startTime = dataElement.fieldValue;
                    break;
                case 'ENDTIME':
                    endTime = dataElement.fieldValue;
                    break;
                case 'STATUS':
                    this.saveElement(date, startTime, endTime, attendanceType);
                    break;
                default:
            }
        });

        return this.timeElements;
    }

    /**
     * Saves the provided data as a TimeElement in the attribute `timeElements`. The created element
     * is sorted into the array structure.
     */
    private saveElement(date: string, startTime: string, endTime: string, attendanceType: string) {
        const currentElement = this.createNewTimeElement(date, startTime, endTime, attendanceType);

        if (
            this.timeElements.length === 0 ||
            this.timeElements[this.timeElements.length - 1].length === 0
        ) {
            // there are no other elements currently saved
            this.timeElements.push([currentElement]);
            return;
        }

        // a previous element exists
        const previousDay: TimeElement[] = this.timeElements[this.timeElements.length - 1];
        const previousElement = previousDay[0];
        if (DateUtil.isSameDay(previousElement.startDate, currentElement.startDate)) {
            previousDay.push(currentElement);
            return;
        }

        this.timeElements.push([currentElement]);
    }

    /**
     * Creates an instance of a TimeElement by parsing the strings into expected types.
     * @param date              the date or more precise the day in the format YYYYMMDD
     * @param startTime         expected format is HHMMSS
     * @param endTime           expected format is HHMMSS
     * @param attendanceType    expected to be a number
     */
    private createNewTimeElement(
        date: string,
        startTime: string,
        endTime: string,
        attendanceType: string,
    ): TimeElement {
        return new TimeElement(
            DateUtil.getDateFromDateAndTime(DateUtil.getDateFromYYYYMMDD(date), startTime),
            new Date(DateUtil.getDateFromDateAndTime(DateUtil.getDateFromYYYYMMDD(date), endTime)),
            Number(attendanceType),
        );
    }
}
