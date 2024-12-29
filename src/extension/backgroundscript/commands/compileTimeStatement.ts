import { BackgroundCommand } from '../../common/enums/command';
import { Communication } from '../communication';
import CompatabilityLayer from '../workers/chromium/compatabilityLayer';


// paths are not relative but start at the extension folder (build output)
const TIME_STATEMENT_WORKER_FILE = 'backgroundscript/webWorker/timeStatementWorker.js';

export async function saveOvertimeFromPDF(communication: Communication, message: object) {
    const timeStatementWorker = await CompatabilityLayer.CreateWorker(TIME_STATEMENT_WORKER_FILE);

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