import FetchURL from './fetchUrl';

/**
 * Takes care of any communication via the network. For example fetching data from APIs.
 */
export default class FetchData {
    /**
     * Contacts the API to get the working times response. The given start- and enddate
     * will be used for the request. The response will be the data returned by the api. This data
     * contains the working times but has to be formatted to be able to use them.
     * @param startDate    the first day to fetch working times for (time is ignored)
     * @param endDate      the last day to fetch working times for, has to be the same or after `startDate` (time is ignored)
     * @returns an unformatted response with the working times or null if logged out
     * @throws if the endDate is not after the startDate
     * @throws if a communication error with api occurs
     */
    public async getWorkingTimes(startDate: Date, endDate: Date): Promise<string | null> {
        if (startDate > endDate || startDate.getDate() > endDate.getDate()) {
            throw new Error('End date is not after start date');
        }

        const result = await this.fetchWorkingTimes(startDate, endDate);

        if (!result.ok) {
            if (result.status === 401) {
                return null;
            }
            throw new Error(
                'Unexpected API response while fetching working times! Received status code: ' +
                    result.status,
            );
        }

        return result.text();
    }

    /**
     * The actual fetching logic for working times (time sheet). Does no validation of inputs or results.
     */
    private async fetchWorkingTimes(startDate: Date, endDate: Date): Promise<Response> {
        const result = await fetch(
            new Request(FetchURL.getTimeSheetFetchURL(startDate, endDate), {
                method: 'GET',
                credentials: 'include',
            }),
        );

        return result;
    }

    /**
     * Contacts the WorkCalendars API to get the planned hours per day.
     * @param employeeNumber    the employee number
     * @param startDate         the first day of the range (time is ignored)
     * @param endDate           the last day of the range (time is ignored)
     * @returns the raw JSON response string or null if logged out
     * @throws if a communication error with api occurs
     */
    public async getPlannedHours(
        employeeNumber: string,
        startDate: Date,
        endDate: Date,
    ): Promise<string | null> {
        const result = await this.fetchPlannedHours(employeeNumber, startDate, endDate);

        if (!result.ok) {
            if (result.status === 401) {
                return null;
            }
            throw new Error(
                'Unexpected API response while fetching planned hours! Received status code: ' +
                    result.status,
            );
        }

        return result.text();
    }

    /**
     * The actual fetching logic for planned hours. Does no validation of inputs or results.
     */
    private async fetchPlannedHours(
        employeeNumber: string,
        startDate: Date,
        endDate: Date,
    ): Promise<Response> {
        const result = await fetch(
            new Request(FetchURL.getWorkCalendarFetchURL(employeeNumber, startDate, endDate), {
                method: 'GET',
                credentials: 'include',
            }),
        );

        return result;
    }

    /**
     * Contacts the API to get a response including the employee id.
     * The response will be the data returned by the api. This data
     * contains the employee id but has to be formatted to be able to use it.
     * @returns an unformatted response with the employee id or null if logged out
     * @throws if a communication error with api occurs
     */
    public async getEmployeeId(): Promise<string | null> {
        const result = await this.fetchEmployeeId();

        if (!result.ok) {
            if (result.status === 401) {
                return null;
            }
            throw new Error(
                'Unexpected API response while fetching employee id! Received status code: ' +
                    result.status,
            );
        }

        return result.text();
    }

    /**
     * The actual fetching logic for employee id. Does no validation of inputs or results.
     */
    private async fetchEmployeeId(): Promise<Response> {
        const result = await fetch(
            new Request(FetchURL.getEmployeeNumberFetchURL(), {
                method: 'GET',
                credentials: 'include',
            }),
        );

        return result;
    }

    /**
     * Contact the API to get the time statement for the given start- and enddate. The response
     * will be the data returned by the api. This has to be compiled to a pdf to be able to use it.
     * @param employeeNumber    the number of the employee to fetch the time statement from
     * @param startDate         the first day of the time statement (time is ignored)
     * @param endDate           the last day of the time statement (time is ignored)
     * @returns the unformatted data of the time statement pdf or null if logged out
     * @throws if the endDate is not after the startDate
     * @throws if a communication error with api occurs
     */
    public async getTimeStatement(
        employeeNumber: string,
        startDate: Date,
        endDate: Date,
    ): Promise<ArrayBuffer | null> {
        if (startDate > endDate || startDate.getDate() > endDate.getDate()) {
            throw new Error('End date is not after start date');
        }

        const result = await this.fetchTimeStatement(employeeNumber, startDate, endDate);

        if (!result.ok) {
            if (result.status === 401) {
                return null;
            }
            throw new Error(
                'Unexpected API response while fetching time statement! Received status code: ' +
                    result.status,
            );
        }

        return result.arrayBuffer();
    }

    /**
     * The actual fetching logic for time statement. Does no validation of inputs or results.
     */
    private async fetchTimeStatement(
        employeeNumber: string,
        startDate: Date,
        endDate: Date,
    ): Promise<Response> {
        const result = await fetch(
            FetchURL.getTimeStatementFetchURL(employeeNumber, startDate, endDate),
        );

        return result;
    }
}
