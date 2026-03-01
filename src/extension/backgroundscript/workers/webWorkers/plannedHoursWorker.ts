import { BackgroundCommand } from '../../../common/enums/command';
import { hasStringContent } from '../../../common/types/messageObject';
import WorkCalendarData from '../../common/models/workCalendarData';
import { ERROR_MSGS } from '../../common/constants';

function parsePlannedHours(message: MessageEvent) {
    try {
        if (!hasStringContent(message.data)) {
            throw new Error('No message or no content received from the content script');
        }

        const jsonObject = JSON.parse(message.data.content);
        const workCalendarData = WorkCalendarData.fromObject(jsonObject);

        const plannedMinutesPerDay: Record<string, number> = {};
        for (const result of workCalendarData.d.results) {
            plannedMinutesPerDay[result.date] = parseFloat(result.targetHours) * 60;
        }

        postMessage({ plannedMinutesPerDay });
    } catch (e) {
        postMessage({
            command: BackgroundCommand.ParsePlannedHours,
            error: { message: ERROR_MSGS.UNABLE_TO_PARSE_DATA },
            originalError: e,
        });
    }
}

onmessage = parsePlannedHours;
