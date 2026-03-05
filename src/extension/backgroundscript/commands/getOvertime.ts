import { BackgroundCommand } from '../../common/enums/command';
import Settings from '../../common/utils/settings';
import StorageManager from '../../common/utils/storageManager';
import { ERROR_MSGS } from '../common/constants';
import Formater from '../common/utils/format';
import { OvertimeCalculator } from '../calculateOvertime';
import { Communication } from '../communication';

/**
 * Calculate the total overtime and send it back to the content script. Sends an error message
 * if overtime can't be calculated.
 */
export async function sendBackOvertime(communication: Communication) {
    let totalOvertime;
    try {
        const daySummaries = await StorageManager.getDaySummaries();
        const plannedMinutesPerDay = await StorageManager.getPlannedMinutesPerDay();
        const timeStatementOvertime = Number(await StorageManager.getTimeStatementOvertime());

        if (daySummaries === null || plannedMinutesPerDay === null) {
            throw new Error('Day summaries or planned minutes not found in storage');
        }
        if (Number.isNaN(timeStatementOvertime)) {
            throw new Error('Time statement overtime in storage is not a number');
        }

        const overtimeCalculator = new OvertimeCalculator();
        totalOvertime = overtimeCalculator.calculateOvertime(
            daySummaries,
            plannedMinutesPerDay,
            timeStatementOvertime,
        );
    } catch (e) {
        console.error(e);
        communication.postCsMessage(BackgroundCommand.GetOvertime, {
            error: {
                message: ERROR_MSGS.INVALID_RESULT,
            },
        });
        return;
    }

    if (await Settings.round5MinIsEnabled()) {
        totalOvertime = Math.round(totalOvertime / 5) * 5;
    }

    communication.postCsMessage(BackgroundCommand.GetOvertime, {
        overtimeText: Formater.minutesToTimeString(totalOvertime),
    });
}
