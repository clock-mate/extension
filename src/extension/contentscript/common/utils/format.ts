import { ErrorData, isErrorData } from '../../../common/types/errorData';
import { isOvertimeObject, OvertimeData } from '../../../common/types/overtimeData';
import { DISPLAY_TEXTS, ERROR_MSGS } from '../constants';
import StatusedPromise from '../models/statusedPromise';
import { DisplayFormat } from '../types/display';

export default class Formater {
    /**
     * Format the given OvertimeData to a string which can be displayed. If an ErrorData object is provided
     * the error message will be formatted. If the given obj is invalid a special error message will be returned.
     * @param data   the object which contains the overtime or error messages
     * @returns the formatted string derived from the given data object
     */
    private static formatDisplayText(data: OvertimeData | ErrorData): string {
        if (isOvertimeObject(data)) {
            return DISPLAY_TEXTS.PREFIX_OVERTIME + data.overtimeText;
        }
        if (isErrorData(data)) {
            return DISPLAY_TEXTS.PREFIX_ERROR + data.error.message;
        } else {
            // no Data
            return DISPLAY_TEXTS.PREFIX_OVERTIME + ERROR_MSGS.NO_DATA;
        }
    }

    /**
     * Determines the latest data which can be shown in the display.
     * This can be a loading placeholder if no data is available.
     * @param calcOvertimeData     the data from a calculate
     */
    public static async getLatestDisplayFormat(
        calcOvertimeData: StatusedPromise<Promise<OvertimeData | ErrorData>>,
    ): Promise<DisplayFormat> {
        if (calcOvertimeData.isResolved) {
            return {
                text: this.formatDisplayText(await calcOvertimeData.promise),
                loading: false,
            };
        }
        // no data to show
        return {
            text: DISPLAY_TEXTS.PREFIX_OVERTIME + DISPLAY_TEXTS.OVERTIME_LOADING,
            loading: true,
        };
    }

    /**
     * Takes the data from the newdisplay and inserts them into the display state.
     * @param displayState    the variable to update the values of
     * @param newDisplay      the new data
     */
    public static updateDisplayState(displayState: DisplayFormat, newDisplay: DisplayFormat) {
        displayState.text = newDisplay.text;
        displayState.loading = newDisplay.loading;
    }

    public static createUnsupportedPageData(): StatusedPromise<Promise<ErrorData>> {
        return new StatusedPromise(
            Promise.resolve({ error: { message: ERROR_MSGS.PAGE_NOT_SUPPORTED } }),
        );
    }
}
