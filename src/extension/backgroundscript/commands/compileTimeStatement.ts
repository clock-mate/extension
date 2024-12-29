import { BackgroundCommand } from '../../common/enums/command';
import StorageManager from '../../common/utils/storageManager';
import { checkForOvertime } from '../backgroundscript';
import { Communication } from '../communication';
import { CompatabilityLayer } from '../workers';


// paths are not relative but start at the extension folder (build output)
const TIME_STATEMENT_WORKER_FILE = 'backgroundscript/webWorker/timeStatementWorker.js';

export async function saveOvertimeFromPDF(communication: Communication, message: object) {
    const timeStatementWorker = await CompatabilityLayer.createWorker(TIME_STATEMENT_WORKER_FILE);

    timeStatementWorker.onmessage = (workerMessage: MessageEvent) => {
        checkForOvertime(
            communication,
            workerMessage,
            BackgroundCommand.CompileTimeSatement,
            (overtime: number) => StorageManager.saveTimeStatementOvertime(overtime),
        );
    };
    timeStatementWorker.onerror = (error: ErrorEvent) => {
        console.error('Worker error:', error.message, error.filename, error.lineno, error.colno);
        communication.postWorkerError(BackgroundCommand.CompileTimeSatement);
    };
    timeStatementWorker.postMessage(message);
}