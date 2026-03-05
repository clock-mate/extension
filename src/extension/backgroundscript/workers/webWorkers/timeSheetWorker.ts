import { BackgroundCommand } from '../../../common/enums/command';
import { hasStringContent } from '../../../common/types/messageObject';
import TimeSheetAggregator from '../../aggregateData/timeSheetAggregator';
import OvertimeCalculator from '../../calculateOvertime/overtimeCalculator';
import { ERROR_MSGS } from '../../common/constants';
import TimeData from '../../common/models/timeData';

function parseTimeSheet(message: MessageEvent) {
    try {
        if (!hasStringContent(message.data)) {
            throw new Error('No message or no content received from the content script');
        }

        const jsonObject = JSON.parse(message.data.content);
        const timeData = TimeData.fromObject(jsonObject);
        const timeSheetAggregator = new TimeSheetAggregator();
        const timeElements = timeSheetAggregator.parseTimeDataToTimeElements(timeData);

        const overtimeCalculator = new OvertimeCalculator();
        const dailySummaries = overtimeCalculator.aggregateDailySummaries(timeElements);
        if (dailySummaries === null) {
            return postMessage({
                command: BackgroundCommand.ParseTimeSheet,
                error: { message: ERROR_MSGS.UNPLAUSIBLE_CALCULATION },
            });
        }

        postMessage({ dailySummaries });
    } catch (e) {
        postMessage({
            command: BackgroundCommand.ParseTimeSheet,
            error: { message: ERROR_MSGS.UNABLE_TO_PARSE_DATA },
            originalError: e,
        });
    }
}

onmessage = parseTimeSheet;
