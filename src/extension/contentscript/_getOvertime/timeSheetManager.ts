import { BackgroundCommand } from '../../common/enums/command';
import BackgroundComm from '../communication/backgroundComm';
import NetworkComm from '../communication/networkComm';
import { config, constStrings } from './constants';
import DateManger from './dateManager';
import Formater from './format';
import SimpleManager from '../_common/interfaces/simpleManager';

/**
 * Takes care of fetching and handling a time sheet (table of working times).
 */
export default class TimeSheetManager implements SimpleManager {
    public constructor(
        public backgroundComm: BackgroundComm,
        public networkComm: NetworkComm,
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
            timeSheetData = await this.networkComm.fetchWorkingTimes(
                DateManger.calculateTimeSheetStartDate(config.monthsToCalculateManually),
                DateManger.calculateTimeSheetEndDate(),
            );
        } catch (e) {
            console.error(e);
            throw new Error(constStrings.errorMsgs.unableToContactAPI);
        }

        const timeSheetResponse = await this.backgroundComm.sendMsgToBackground(
            BackgroundCommand.ParseTimeSheet,
            timeSheetData,
        );

        Formater.throwIfErrorMessage(timeSheetResponse);
        // background only sends content if there is an error
    }
}
