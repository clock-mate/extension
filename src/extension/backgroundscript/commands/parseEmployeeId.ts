import { BackgroundCommand } from '../../common/enums/command';
import { Communication } from '../communication';
import CompatabilityLayer from '../workers/chromium/compatabilityLayer';

// paths are not relative but start at the extension folder (build output)
const EMPLOYEE_ID_WORKER_FILE = 'backgroundscript/webWorker/employeeIdWorker.js';

export async function sendBackEmployeeId(communication: Communication, message: object) {
    const employeeIdWorker = await CompatabilityLayer.CreateWorker(EMPLOYEE_ID_WORKER_FILE);

    employeeIdWorker.onmessage = (workerMessage: MessageEvent) => {
        printPossibleError(workerMessage.data);
        communication.postCsMessage(BackgroundCommand.ParseEmployeeId, workerMessage.data);
    };
    employeeIdWorker.onerror = (error: ErrorEvent) => {
        console.error('Worker error:', error.message, error.filename, error.lineno, error.colno);
        communication.postWorkerError(BackgroundCommand.ParseEmployeeId);
    };
    employeeIdWorker.postMessage(message);
}