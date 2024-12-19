export default class Formater {

    /**
     * Format the given OvertimeData to a string which can be displayed. If an ErrorData object is provided
     * the error message will be formatted. If the given obj is invalid a special error message will be returned.
     * @param data   the object which contains the overtime or error messages
     * @returns the formatted string derived from the given data object
     */
    private static formatDisplayText(data: OvertimeData | ErrorData): string {
        if (isOvertimeObject(data)) {
            return constStrings.prefixOvertime + data.overtimeText;
        }
        if (isErrorData(data)) {
            return constStrings.prefixError + data.error.message;
        } else {
            // no Data
            return constStrings.prefixOvertime + constStrings.errorMsgs.noData;
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
            text: constStrings.prefixOvertime + constStrings.overtimeLoading,
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
            new Promise<ErrorData>((resolve) => {
                resolve({ error: { message: constStrings.errorMsgs.pageNotSupported } });
            }),
        );
    }
}