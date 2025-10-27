import { BackgroundCommand } from '../../common/enums/command';
import Settings from '../../common/utils/settings';
import { ERROR_MSGS } from '../common/constants';
import SimpleManager from '../common/interfaces/simpleManager';
import { BackgroundComm } from '../communication';
import { FetchData } from '../fetchData';
import DateUtil from './utils/dateUtil';
import Formater from './utils/format';

/**
 * Takes care of fetching and handling a time sheet (table of working times).
 */
export default class TimeSheetManager implements SimpleManager {
    public constructor(
        public backgroundComm: BackgroundComm,
        public fetchData: FetchData,
    ) {}

    public initialize() {
        return;
    }

    /**
     * Fetches a new time sheet and sends the time sheet to the
     * background script.
     * @throws with a displayable error message, if a communcation error occurs
     * or the data has an unexpected format
     */
    public performAction() {
        return this.sendTimeSheetData();
    }

    private async sendTimeSheetData() {
        let timeSheetData;
        try {
            timeSheetData = await this.fetchData.getWorkingTimes(
                DateUtil.calculateTimeSheetStartDate(await Settings.getMonthsToCalcManually()),
                DateUtil.calculateTimeSheetEndDate(),
            );
        } catch (e) {
            console.error(e);
            throw new Error(ERROR_MSGS.UNABLE_TO_CONTACT_API);
        }
        if (timeSheetData === null) {
            throw new Error(ERROR_MSGS.LOGGED_OUT);
        }

        const timeSheetResponse = await this.backgroundComm.sendMsgToBackground(
            BackgroundCommand.ParseTimeSheet,
            timeSheetData,
            await Settings.getFullSettings(),
        );

        Formater.throwIfErrorMessage(timeSheetResponse);
        // background only sends content if there is an error
    }
}
