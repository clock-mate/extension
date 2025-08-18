import { BackgroundCommand } from '../../../common/enums/command';
import { isSettingsData, SettingsData } from '../../../common/types/settingsData';
import { TimeSheetAggregator } from '../../aggregateData';
import { OvertimeCalculator } from '../../calculateOvertime';
import { ERROR_MSGS } from '../../common/constants';
import TimeData from '../../common/models/timeData';
import Formater from '../utils/format';

function saveOvertimeFromTimeSheet(message: MessageEvent) {
    const timeSheetAggregator = new TimeSheetAggregator();
    const overtimeCalculator = new OvertimeCalculator();
    let settings: SettingsData;

    try {
        if (!('content' in message.data) || typeof message.data.content !== 'string') {
            throw new Error('No message or no content received from the content script');
        }
        if (!('settings' in message.data) || !isSettingsData(message.data.settings)) {
            throw new Error('No settings received from the content script');
        }
        settings = message.data.settings;

        const jsonObject = Formater.getJSONFromAPIData(message.data.content);
        const timeData = TimeData.fromObject(jsonObject);

        timeSheetAggregator.timeElements =
            timeSheetAggregator.parseTimeDataToTimeElements(timeData);
    } catch (e) {
        postMessage({
            command: BackgroundCommand.ParseTimeSheet,
            error: { message: ERROR_MSGS.UNABLE_TO_PARSE_DATA },
            originalError: e,
        });
        return;
    }

    const overtimeInMinutes = overtimeCalculator.calculateOvertime(
        timeSheetAggregator.timeElements,
        settings.halfPublicHolidaysConfig,
    );

    postMessage({
        // send overtime to backgroundscript since worker has no access to storage api
        overtime: overtimeInMinutes,
    });
}

onmessage = saveOvertimeFromTimeSheet;
