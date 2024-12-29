import { BackgroundCommand } from '../../common/enums/command';
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
                message: constStrings.errorMsgs.unableToParseData,
            },
        });
        return;
    }

    communication.postCsMessage(BackgroundCommand.GetOvertime, {
        overtimeText: Formater.minutesToTimeString(totalOvertime),
    });
}
