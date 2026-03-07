import { BackgroundCommand } from '../../common/enums/command';
import { isEmployeeIdData } from '../../common/types/employeeIdData';
import { ErrorData, isErrorData } from '../../common/types/errorData';
import { isOvertimeObject, OvertimeData } from '../../common/types/overtimeData';
import StorageManager from '../../common/utils/storageManager';
import { ERROR_MSGS } from '../common/constants';
import { DisplayFormat } from '../common/types/display';
import CommonFormater from '../common/utils/format';
import { BackgroundComm } from '../communication';
import { FetchData } from '../fetchData';
import { View } from '../showOvertime';
import { PlannedHoursManager, TimeSheetManager, TimeStatementManager } from './';
import Formater from './utils/format';

export default class OvertimeManager {
    public view: View | undefined;

    constructor(
        public backgroundComm: BackgroundComm,
        public fetchData: FetchData,
    ) {}

    // fetches data and sends requests to background script, returns a displayable text in any case
    public async calculateNewOvertimeData(): Promise<OvertimeData | ErrorData> {
        try {
            const cachedEmployeeId = await StorageManager.getCachedEmployeeId();

            const timeSheet = new TimeSheetManager(
                this.backgroundComm,
                this.fetchData,
            ).performAction();

            // fire the fresh employee ID request without awaiting yet
            const freshEmployeeIdPromise = this.fetchAndParseEmployeeId();

            let timeStatement: Promise<void>;
            let plannedHours: Promise<void>;

            if (cachedEmployeeId !== null) {
                // use cached ID to fire dependent requests immediately
                const abortController = new AbortController();
                timeStatement = new TimeStatementManager(
                    this.backgroundComm,
                    this.fetchData,
                    cachedEmployeeId,
                    abortController.signal,
                ).performAction();
                plannedHours = new PlannedHoursManager(
                    this.backgroundComm,
                    this.fetchData,
                    cachedEmployeeId,
                    abortController.signal,
                ).performAction();

                const freshEmployeeId = await freshEmployeeIdPromise;

                if (freshEmployeeId !== cachedEmployeeId) {
                    // ID changed: abort in-flight requests and re-fire with fresh ID
                    abortController.abort();
                    await Promise.allSettled([timeStatement, plannedHours]);
                    timeStatement = new TimeStatementManager(
                        this.backgroundComm,
                        this.fetchData,
                        freshEmployeeId,
                    ).performAction();
                    plannedHours = new PlannedHoursManager(
                        this.backgroundComm,
                        this.fetchData,
                        freshEmployeeId,
                    ).performAction();
                }
            } else {
                // no cache yet: await employee ID then fire dependent requests
                const freshEmployeeId = await freshEmployeeIdPromise;
                timeStatement = new TimeStatementManager(
                    this.backgroundComm,
                    this.fetchData,
                    freshEmployeeId,
                ).performAction();
                plannedHours = new PlannedHoursManager(
                    this.backgroundComm,
                    this.fetchData,
                    freshEmployeeId,
                ).performAction();
            }

            /**
             * Wait till all requests finished before calculating total overtime.
             * This late awaiting means that requests (timestatement + plannedhors) with a false cached ID
             * will not cause an error before a new employee ID is fetched and new requests are fired.
             */
            await timeStatement;
            await timeSheet;
            await plannedHours;
        } catch (e) {
            if (typeof e !== 'object' || !e || !('message' in e) || typeof e.message !== 'string') {
                // should never happen but in case we didn't catch an Error object but something else
                console.error(e);
                return {
                    error: {
                        message: ERROR_MSGS.UNKNOWN,
                    },
                };
            }
            return {
                error: {
                    message: e.message,
                },
            };
        }
        return this.getOvertimeData();
    }

    private async getOvertimeData(): Promise<OvertimeData | ErrorData> {
        const overtimeResponse = await this.backgroundComm.sendMsgToBackground(
            BackgroundCommand.GetOvertime,
        );

        if (!isOvertimeObject(overtimeResponse) && !isErrorData(overtimeResponse)) {
            return { error: { message: ERROR_MSGS.UNEXPECTED_BACKGROUND_RESPONSE } };
        }
        return overtimeResponse;
    }

    /**
     * Fetches and parses data for the employee id.
     * @returns the employee id
     * @throws with a displayable error message, if a communcation error occurs
     * or the data has an unexpected format
     */
    private async fetchAndParseEmployeeId(): Promise<string> {
        let employeeData;
        try {
            employeeData = await this.fetchData.getEmployeeId();
        } catch (e) {
            console.error(e);
            throw new Error(ERROR_MSGS.UNABLE_TO_CONTACT_API);
        }
        if (employeeData === null) {
            throw new Error(ERROR_MSGS.LOGGED_OUT);
        }

        const employeeIdResponse = await this.backgroundComm.sendMsgToBackground(
            BackgroundCommand.ParseEmployeeId,
            employeeData,
        );

        Formater.throwIfErrorMessage(employeeIdResponse);
        if (!isEmployeeIdData(employeeIdResponse)) {
            console.error('Received response from background without employee ID');
            throw new Error(ERROR_MSGS.UNEXPECTED_BACKGROUND_RESPONSE);
        }

        const employeeId = employeeIdResponse.employeeId;
        await StorageManager.saveCachedEmployeeId(employeeId);
        return employeeId;
    }

    // called from the reload btn, recalculates the overtime
    public reloadOvertimeData(displayState: DisplayFormat) {
        displayState.loading = true;
        View.startLoading(); // start loading immediately

        // == Start new request ==
        const calculatedData = this.calculateNewOvertimeData();

        // == Register action for promise resolving ==
        calculatedData.then(async () => {
            CommonFormater.updateDisplayState(
                displayState,
                await CommonFormater.getDisplayFormat(calculatedData),
            );
            if (this.view === undefined) {
                console.error(
                    `No view set in ${new OvertimeManager(this.backgroundComm, this.fetchData).constructor.name}. ` +
                        'Unable to rerender display.',
                );
                View.removeDisplay();
                return;
            }
            this.view.renderDisplay(displayState);
        });
    }
}
