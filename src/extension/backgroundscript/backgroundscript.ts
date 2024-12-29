import browser from 'webextension-polyfill';
import { BackgroundCommand } from '../common/enums/command';
import { isErrorData } from '../common/types/errorData';
import { isMessageObject } from '../common/types/messageObject';
import {
    saveOvertimeFromPDF,
    saveOvertimeFromTimeSheet,
    sendBackEmployeeId,
    sendBackOvertime,
} from './commands';
import { ERROR_MSGS } from './common/constants';
import ErrorHandling from './common/utils/errorHandling';
import Communication from './communication/communication';

function connectedToContentScript(port: browser.Runtime.Port) {
    if (port.sender?.id !== browser.runtime.id) {
        // sender id is not the one of this extension
        // invalid id, incoming request might be malicious
        console.error(ERROR_MSGS.INVALID_REQUEST);
        port.disconnect();
        return;
    }
    const communication = new Communication(port);
    communication.portToCs.onMessage.addListener((message) => {
        if (!isMessageObject(message)) {
            communication.sendBackUnknownCmdError();
            return;
        }
        switch (message.command) {
            case BackgroundCommand.ParseTimeSheet:
                saveOvertimeFromTimeSheet(communication, message);
                break;
            case BackgroundCommand.ParseEmployeeId:
                sendBackEmployeeId(communication, message);
                break;
            case BackgroundCommand.CompileTimeSatement:
                saveOvertimeFromPDF(communication, message);
                break;
            case BackgroundCommand.GetOvertime:
                sendBackOvertime(communication);
                break;
            default:
                communication.sendBackUnknownCmdError();
                break;
        }
    });
}

/**
 * Makes multiple checks on the MessageEvent data and calls the callback function with the overtime.
 * The given MessageEvent can contain an error message in the form of `error: { message: string }`
 * in which case any `originalError`s will be printed and an error response will be sent on the port.
 * If the MessageEvent data has the `action` attribute the callback function wont be called either.
 * If the overtime is in the data then the callback will be called with the overtime.
 * @param communication    the communication instance to send messages with
 * @param message          the message which to check for errors and the overtime
 * @param command          the command to send as a response on the port
 * @param callback         will be called once the overtime was found in the MessageEvent data
 * @TODO reevaluate if this message/communication can't use the message object type
 * @TODO refactor
 */
export function checkForOvertime(
    communication: Communication,
    message: MessageEvent,
    command: BackgroundCommand,
    callback: (overtime: number) => void,
) {
    const receivedData: unknown = message.data;

    if (isErrorData(receivedData)) {
        // an error was caught, forward the message
        communication.postCsMessage(command, receivedData);
        ErrorHandling.printPossibleError(receivedData);
        return;
    }
    if (typeof receivedData === 'object' && receivedData !== null && 'action' in receivedData) {
        // the pdf worker sends a ready message which is caught by this check
        if (receivedData.action !== 'ready') {
            console.error('A message with action was sent which is not the ready action:');
            console.error(message);
            communication.postWorkerError(command);
        }
        return; // pdf worker only notified that it is ready, nothing to do
    }
    if (
        typeof receivedData !== 'object' ||
        receivedData === null ||
        !('overtime' in receivedData) ||
        typeof receivedData.overtime !== 'number'
    ) {
        // should not happen
        console.error('Received an unexpected response from time time statement worker:');
        console.error(message);
        communication.postWorkerError(command);
        return;
    }

    callback(receivedData.overtime);
    communication.postCsMessage(command);
}

// listen for connection opening from the content script
browser.runtime.onConnect.addListener(connectedToContentScript);
