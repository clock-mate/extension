import TimeData from '../common/models/timeData';
import TimeData_Result from '../common/models/timeData_Result';
import TimeElement from '../common/models/timeElement';

export default class TimeSheetAggregator {
    /** Maps a date string (YYYYMMDD) to the TimeElements that belong to that day. */
    timeElements: Record<string, TimeElement[]>;

    constructor() {
        this.timeElements = {};
    }

    public parseTimeDataToTimeElements(timeData: TimeData): Record<string, TimeElement[]> {
        const results: TimeData_Result[] = timeData.d.results;

        let date: string;
        let startTime: string;
        let endTime: string;
        let attendanceType: string;
        let calculationMotive: string;

        results.forEach((dataElement) => {
            // temporarily save the necessary information
            switch (dataElement.fieldName) {
                case 'WORKDATE':
                    date = dataElement.fieldValue;
                    break;
                case 'AWART':
                    attendanceType = dataElement.fieldValue;
                    break;
                case 'BEMOT':
                    calculationMotive = dataElement.fieldValue;
                    break;
                case 'STARTTIME':
                    startTime = dataElement.fieldValue;
                    break;
                case 'ENDTIME':
                    endTime = dataElement.fieldValue;
                    break;
                case 'STATUS':
                    this.saveElement(date, startTime, endTime, attendanceType, calculationMotive);
                    break;
                default:
            }
        });

        return this.timeElements;
    }

    /**
     * Saves the provided data as a TimeElement in the attribute `timeElements`, grouped
     * by the YYYYMMDD date key.
     */
    private saveElement(
        date: string,
        startTime: string,
        endTime: string,
        attendanceType: string,
        calculationMotive: string,
    ) {
        const currentElement = this.createNewTimeElement(
            startTime,
            endTime,
            attendanceType,
            calculationMotive,
        );

        if (!this.timeElements[date]) {
            this.timeElements[date] = [];
        }
        this.timeElements[date].push(currentElement);
    }

    /**
     * Creates an instance of a TimeElement by parsing the strings into expected types.
     * @param startTime         expected format is HHMMSS
     * @param endTime           expected format is HHMMSS
     * @param attendanceType    expected to be a number
     * @param calculationMotive expected to be a number
     */
    private createNewTimeElement(
        startTime: string,
        endTime: string,
        attendanceType: string,
        calculationMotive: string,
    ): TimeElement {
        return new TimeElement(
            startTime,
            endTime,
            Number(attendanceType),
            Number(calculationMotive),
        );
    }
}
