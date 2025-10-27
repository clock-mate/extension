import { BackgroundCommand } from '../../common/enums/command';
import { isEmployeeIdData } from '../../common/types/employeeIdData';
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
        public networkComm: FetchData,
    ) {}

    public initialize() {
        return;
    }

    /**
     * Fetches a new time statement and necessary related data and sends the
     * time statement to the background script.
     * @throws with a displayable error message, if a communcation error occurs
     * or the data has an unexpected format
     */
    public async performAction() {
        const employeeId = await this.fetchAndParseEmployeeId();
        await this.fetchAndSendTimeStatement(employeeId);
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
            employeeData = await this.networkComm.getEmployeeId();
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

        return employeeIdResponse.employeeId;
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
            rawTimeStatementData = await this.networkComm.getTimeStatement(
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
