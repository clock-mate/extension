import * as browser from 'webextension-polyfill';
import { BackgroundCommand } from '../../common/enums/command';
import { isBackgroundResponse } from '../../common/types/backgroundResponse';
import { EmployeeIdData } from '../../common/types/employeeIdData';
import { ErrorData } from '../../common/types/errorData';
import { MessageObject } from '../../common/types/messageObject';
import { OvertimeData } from '../../common/types/overtimeData';

/**
 * Takes care of communication with the background script.
 */
export default class BackgroundComm {
    private portToBackground: browser.Runtime.Port | undefined;

    /**
     * Sends a message to the background script. The response from the background script will be returned.
     * Depending on the command this will be a string with different content.
     * @param command    the command to send to the background script
     * @param content    the content to send to the background script
     * @returns a response for the command
     */
    public async sendMsgToBackground(
        command: BackgroundCommand,
        content?: string,
    ): Promise<OvertimeData | EmployeeIdData | ErrorData | undefined> {
        return new Promise((resolve) => {
            if (this.portToBackground == undefined) {
                this.portToBackground = browser.runtime.connect(); // buid connection if not already established

                this.portToBackground.onDisconnect.addListener(() => {
                    // delete when connnection gets disconnected
                    this.portToBackground = undefined;
                });
            }

            // connection has been established
            this.portToBackground.onMessage.addListener((response) => {
                // check if the response is a response for this request
                if (isBackgroundResponse(response) && response.command === command) {
                    resolve(response.content);
                }
            });
            const message: MessageObject = { command: command, content: content };
            this.portToBackground.postMessage(message);
        });
    }
}
