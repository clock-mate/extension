import { BackgroundCommand } from '../../common/enums/command';
import { ErrorData, isErrorData } from '../../common/types/errorData';
import { isOvertimeObject, OvertimeData } from '../../common/types/overtimeData';
import { ERROR_MSGS } from '../common/constants';
import { DisplayFormat } from '../common/types/display';
import Formater from '../common/utils/format';
import { BackgroundComm } from '../communication';
import { FetchData } from '../fetchData';
import { View } from '../showOvertime';
import { TimeSheetManager, TimeStatementManager } from './';

export default class OvertimeManager {
    public view: View | undefined;

    constructor(
        public backgroundComm: BackgroundComm,
        public fetchData: FetchData,
    ) {}

    // fetches data and sends requests to background script, returns a displayable text in any case
    public async calculateNewOvertimeData(): Promise<OvertimeData | ErrorData> {
        try {
            const timeStatement = new TimeStatementManager(
                this.backgroundComm,
                this.fetchData,
            ).performAction();
            const timeSheet = new TimeSheetManager(
                this.backgroundComm,
                this.fetchData,
            ).performAction();

            // wait until both requests finished before calculating total overtime
            await timeStatement;
            await timeSheet;
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

    // called from the reload btn, recalculates the overtime
    public reloadOvertimeData(displayState: DisplayFormat) {
        displayState.loading = true;
        View.startLoading(); // start loading immediately

        // == Start new request ==
        const calculatedData = this.calculateNewOvertimeData();

        // == Register action for promise resolving ==
        calculatedData.then(async () => {
            Formater.updateDisplayState(
                displayState,
                await Formater.getDisplayFormat(calculatedData),
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
