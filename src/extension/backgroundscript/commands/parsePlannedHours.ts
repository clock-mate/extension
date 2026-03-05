import { BackgroundCommand } from '../../common/enums/command';
import { isErrorData } from '../../common/types/errorData';
import StorageManager from '../../common/utils/storageManager';
import ErrorHandling from '../common/utils/errorHandling';
import { Communication } from '../communication';
import { CompatabilityLayer } from '../workers';

// paths are not relative but start at the extension folder (build output)
const PLANNED_HOURS_WORKER_FILE = 'backgroundscript/webWorker/plannedHoursWorker.js';

export async function savePlannedHours(communication: Communication, message: object) {
    const plannedHoursWorker = await CompatabilityLayer.createWorker(PLANNED_HOURS_WORKER_FILE);

    plannedHoursWorker.onmessage = (workerMessage: MessageEvent) => {
        const data: unknown = workerMessage.data;

        if (isErrorData(data)) {
            communication.postCsMessage(BackgroundCommand.ParsePlannedHours, data);
            ErrorHandling.printPossibleError(data);
            return;
        }

        // Only basic type checking, assume correct data otherwise
        if (
            typeof data !== 'object' ||
            data === null ||
            !('plannedMinutesPerDay' in data) ||
            typeof data.plannedMinutesPerDay !== 'object' ||
            data.plannedMinutesPerDay === null
        ) {
            console.error('Received an unexpected response from the planned hours worker:');
            console.error(data);
            communication.postWorkerError(BackgroundCommand.ParsePlannedHours);
            return;
        }

        StorageManager.savePlannedMinutesPerDay(
            data.plannedMinutesPerDay as Record<string, number>,
        ).then(() => {
            communication.postCsMessage(BackgroundCommand.ParsePlannedHours);
        });
    };
    plannedHoursWorker.onerror = (error: ErrorEvent) => {
        console.error('Worker error:', error.message, error.filename, error.lineno, error.colno);
        communication.postWorkerError(BackgroundCommand.ParsePlannedHours);
    };
    plannedHoursWorker.postMessage(message);
}
