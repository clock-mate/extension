import { BackgroundCommand } from '../../../common/enums/command';
import { TimeSheetAggregator } from '../../aggregateData';
import { OvertimeCalculator } from '../../calculateOvertime';
import config from '../../common/config.json';
import { ERROR_MSGS } from '../../common/constants';
import TimeData from '../../common/models/timeData';
import Formater from '../utils/format';

function saveOvertimeFromTimeSheet(message: MessageEvent) {
    // TODO load publicHolidays from settings
    const timeSheetAggregator = new TimeSheetAggregator();
    const overtimeCalculator = new OvertimeCalculator(config.publicHolidays);

    try {
        if (!('content' in message.data) || typeof message.data.content !== 'string') {
            throw new Error('No message or no content received from the content script');
        }
        const jsonObject = Formater.getJSONFromAPIData(message.data.content);
        const timeData = TimeData.fromObject(jsonObject);

        timeSheetAggregator.timeElements = timeSheetAggregator.parseTimeDataToTimeElements(timeData);
    } catch (e) {
        postMessage({
            command: BackgroundCommand.ParseTimeSheet,
            error: { message: ERROR_MSGS.UNABLE_TO_PARSE_DATA },
            originalError: e,
        });
        return;
    }

    const overtimeInMinutes = overtimeCalculator.calculateOvertime(timeSheetAggregator.timeElements);

    postMessage({
        // send overtime to backgroundscript since worker has no access to storage api
        overtime: overtimeInMinutes,
    });
}

onmessage = saveOvertimeFromTimeSheet;
