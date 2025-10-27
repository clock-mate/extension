import { BackgroundCommand } from '../../common/enums/command';
import ErrorHandling from '../common/utils/errorHandling';
import { Communication } from '../communication';
import { CompatabilityLayer } from '../workers';

// paths are not relative but start at the extension folder (build output)
const EMPLOYEE_ID_WORKER_FILE = 'backgroundscript/webWorker/employeeIdWorker.js';

export async function sendBackEmployeeId(communication: Communication, message: object) {
    const employeeIdWorker = await CompatabilityLayer.createWorker(EMPLOYEE_ID_WORKER_FILE);

    employeeIdWorker.onmessage = (workerMessage: MessageEvent) => {
        ErrorHandling.printPossibleError(workerMessage.data);
        communication.postCsMessage(BackgroundCommand.ParseEmployeeId, workerMessage.data);
    };
    employeeIdWorker.onerror = (error: ErrorEvent) => {
        console.error('Worker error:', error.message, error.filename, error.lineno, error.colno);
        communication.postWorkerError(BackgroundCommand.ParseEmployeeId);
    };
    employeeIdWorker.postMessage(message);
}
