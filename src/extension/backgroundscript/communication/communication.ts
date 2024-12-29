import browser from 'webextension-polyfill';
import { BackgroundCommand } from '../../common/enums/command';
import { OvertimeData } from '../../common/types/overtimeData';
import { ErrorData } from '../../common/types/errorData';
import { BackgroundResponse } from '../../common/types/backgroundResponse';
import { ERROR_MSGS } from '../common/constants';

export default class Communication {
    public constructor(public portToCs: browser.Runtime.Port) {}

    /**
     * Posts a message to the content script.
     * @param command   the command to send to the content script
     * @param data      the data to send to the content script
     */
    public postCsMessage(command: BackgroundCommand, data?: OvertimeData | ErrorData) {
        const message: BackgroundResponse = { command: command, content: data };
        this.portToCs.postMessage(message);
    }

    /**
     * Posts a message with an error message. The error message is for unexpected worker errors.
     * @param command    the command to send along side the error message
     */
    public postWorkerError(command: BackgroundCommand) {
        const message: BackgroundResponse = {
            command: command,
            content: { error: { message: ERROR_MSGS.UNEXPECTED_WORKER_ERROR } },
        };
        this.portToCs.postMessage(message);
    }
    
    public sendBackUnknownCmdError() {
        // explicitly break the messaging contract since, there is no command to send back
        this.portToCs.postMessage({
            error: {
                message: ERROR_MSGS.INVALID_COMMAND,
            },
        });
    }
}
