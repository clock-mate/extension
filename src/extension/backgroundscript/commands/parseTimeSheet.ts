import { Communication } from '../communication';
import { CompatabilityLayer } from '../workers';

// paths are not relative but start at the extension folder (build output)
const TIME_SHEET_WORKER_FILE = 'backgroundscript/webWorker/timeSheetWorker.js';

export async function saveOvertimeFromTimeSheet(communication: Communication, message: object) {
    const timeSheetWorker = await CompatabilityLayer.createWorker(TIME_SHEET_WORKER_FILE);

    timeSheetWorker.onmessage = (workerMessage: MessageEvent) => {
        checkForOvertime(
            communication,
            workerMessage,
            BackgroundCommand.ParseTimeSheet,
            (overtime: number) => StorageManager.saveTimeSheetOvertime(overtime),
        );
    };
    timeSheetWorker.onerror = (error: ErrorEvent) => {
        console.error('Worker error:', error.message, error.filename, error.lineno, error.colno);
        communication.postWorkerError(BackgroundCommand.ParseTimeSheet);
    };
    timeSheetWorker.postMessage(message);
}