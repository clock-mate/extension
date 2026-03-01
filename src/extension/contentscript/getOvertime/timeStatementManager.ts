import { BackgroundCommand } from '../../common/enums/command';
import Settings from '../../common/utils/settings';
import { ERROR_MSGS } from '../common/constants';
import SimpleManager from '../common/interfaces/simpleManager';
import { BackgroundComm } from '../communication';
import { FetchData } from '../fetchData';
import DateManger from './utils/dateUtil';
import Formater from './utils/format';

/**
 * Takes care of fetching and handling a time statement (pdf file).
 */
export default class TimeStatementManager implements SimpleManager {
    public constructor(
        public backgroundComm: BackgroundComm,
        public fetchData: FetchData,
        public employeeId: string,
    ) {}

    public initialize() {
        return;
    }

    /**
     * Fetches a new time statement and sends the time statement to the background script.
     * @throws with a displayable error message, if a communcation error occurs
     * or the data has an unexpected format
     */
    public async performAction() {
        await this.fetchAndSendTimeStatement(this.employeeId);
    }

    /**
     * Fetches the time statement (pdf file) and sends it to the background script.
     * @param employeeId the employee id to fetch the time statement for
     * @throws  with a displayable error message, if a communcation error occurs
     * or the data has an unexpected format
     */
    private async fetchAndSendTimeStatement(employeeId: string) {
        let rawTimeStatementData;
        try {
            rawTimeStatementData = await this.fetchData.getTimeStatement(
                employeeId,
                DateManger.calculateTimeStatementStartDate(
                    await Settings.getMonthsToCalcManually(),
                ),
                DateManger.calculateTimeStatementEndDate(await Settings.getMonthsToCalcManually()),
            );
        } catch (e) {
            console.error(e);
            throw new Error(ERROR_MSGS.UNABLE_TO_CONTACT_API);
        }
        if (rawTimeStatementData === null) {
            throw new Error(ERROR_MSGS.LOGGED_OUT);
        }

        const timeStatementResponse = await this.backgroundComm.sendMsgToBackground(
            BackgroundCommand.CompileTimeStatement,
            Formater.convertArrayBufferToBase64(rawTimeStatementData),
        );

        Formater.throwIfErrorMessage(timeStatementResponse);
        // background only sends content if there is an error
    }
}
