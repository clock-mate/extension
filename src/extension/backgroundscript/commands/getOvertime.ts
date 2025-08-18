import { BackgroundCommand } from '../../common/enums/command';
import Settings from '../../common/utils/settings';
import StorageManager from '../../common/utils/storageManager';
import { ERROR_MSGS } from '../common/constants';
import Formater from '../common/utils/format';
import { Communication } from '../communication';

/**
 * Calculate the total overtime and send it back to the content script. Sends an error message
 * if overtime can't be calculated.
 */
export async function sendBackOvertime(communication: Communication) {
    let totalOvertime;
    try {
        const timeSheetOvertime = Number(await StorageManager.getTimeSheetOvertime());
        const timeStatementOvertime = Number(await StorageManager.getTimeStatementOvertime());
        if (Number.isNaN(timeSheetOvertime) || Number.isNaN(timeStatementOvertime)) {
            throw new Error('Overtime in storage is not a number');
        }

        totalOvertime = timeSheetOvertime + timeStatementOvertime;
    } catch (e) {
        console.error(e);
        communication.postCsMessage(BackgroundCommand.GetOvertime, {
            error: {
                message: ERROR_MSGS.UNABLE_TO_PARSE_DATA,
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
