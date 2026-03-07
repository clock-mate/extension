import { BackgroundCommand } from '../../common/enums/command';
import { isErrorData } from '../../common/types/errorData';
import StorageManager from '../../common/utils/storageManager';
import DaySummary from '../common/models/daySummary';
import ErrorHandling from '../common/utils/errorHandling';
import { Communication } from '../communication';
import { CompatabilityLayer } from '../workers';

// paths are not relative but start at the extension folder (build output)
const TIME_SHEET_WORKER_FILE = 'backgroundscript/webWorker/timeSheetWorker.js';

export async function saveTimeSheetData(communication: Communication, message: object) {
    const timeSheetWorker = await CompatabilityLayer.createWorker(TIME_SHEET_WORKER_FILE);

    timeSheetWorker.onmessage = (workerMessage: MessageEvent) => {
        const data: unknown = workerMessage.data;

        if (isErrorData(data)) {
            communication.postCsMessage(BackgroundCommand.ParseTimeSheet, data);
            ErrorHandling.printPossibleError(data);
            return;
        }

        // Only basic type checking, assume correct data otherwise
        if (
            typeof data !== 'object' ||
            data === null ||
            !('dailySummaries' in data) ||
            typeof data.dailySummaries !== 'object' ||
            data.dailySummaries === null
        ) {
            console.error('Received an unexpected response from the time sheet worker:');
            console.error(data);
            communication.postWorkerError(BackgroundCommand.ParseTimeSheet);
            return;
        }

        StorageManager.saveDaySummaries(data.dailySummaries as Record<string, DaySummary>).then(
            () => {
                communication.postCsMessage(BackgroundCommand.ParseTimeSheet);
            },
        );
    };
    timeSheetWorker.onerror = (error: ErrorEvent) => {
        console.error('Worker error:', error.message, error.filename, error.lineno, error.colno);
        communication.postWorkerError(BackgroundCommand.ParseTimeSheet);
    };
    timeSheetWorker.postMessage(message);
}
