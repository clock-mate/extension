import { BackgroundCommand } from '../../common/enums/command';
import Settings from '../../common/utils/settings';
import { ERROR_MSGS } from '../common/constants';
import SimpleManager from '../common/interfaces/simpleManager';
import { BackgroundComm } from '../communication';
import { FetchData } from '../fetchData';
import DateUtil from './utils/dateUtil';
import Formater from './utils/format';

/**
 * Takes care of fetching and handling the planned working hours (WorkCalendars API).
 */
export default class PlannedHoursManager implements SimpleManager {
    public constructor(
        public backgroundComm: BackgroundComm,
        public fetchData: FetchData,
        public employeeId: string,
    ) {}

    public initialize() {
        return;
    }

    /**
     * Fetches the planned hours and sends them to the background script.
     * @throws with a displayable error message, if a communication error occurs
     * or the data has an unexpected format
     */
    public async performAction() {
        await this.fetchAndSendPlannedHours(this.employeeId);
    }

    /**
     * Fetches the planned hours from the WorkCalendars API and sends them to the background script.
     * @param employeeId the employee id to fetch the planned hours for
     * @throws with a displayable error message, if a communication error occurs
     * or the data has an unexpected format
     */
    private async fetchAndSendPlannedHours(employeeId: string) {
        let plannedHoursData;
        try {
            plannedHoursData = await this.fetchData.getPlannedHours(
                employeeId,
                DateUtil.calculateTimeSheetStartDate(await Settings.getMonthsToCalcManually()),
                DateUtil.calculateTimeSheetEndDate(),
            );
        } catch (e) {
            console.error(e);
            throw new Error(ERROR_MSGS.UNABLE_TO_CONTACT_API);
        }
        if (plannedHoursData === null) {
            throw new Error(ERROR_MSGS.LOGGED_OUT);
        }

        const response = await this.backgroundComm.sendMsgToBackground(
            BackgroundCommand.ParsePlannedHours,
            plannedHoursData,
        );

        Formater.throwIfErrorMessage(response);
        // background only sends content if there is an error
    }
}
