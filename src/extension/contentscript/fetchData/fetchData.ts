import FetchURL from './fetchUrl';
import Formater from './utils/format';

/**
 * Takes care of any communication via the network. For example fetching data from APIs.
 */
export default class FetchData {
    private csrfToken: string | undefined;

    /**
     * Contacts the API to get the current CSRF token. The token can be used to
     * make future POST requests to the API.
     * @throws if the token is not sent by the API (except when logged out)
     */
    private async fetchCSRFToken() {
        const csrfResponse = await fetch(
            new Request(FetchURL.getTimeSheetFetchURL(), {
                method: 'HEAD',
                credentials: 'include',
                headers: {
                    'x-csrf-token': 'Fetch',
                },
            }),
        );

        if (csrfResponse.status === 401) {
            this.csrfToken = undefined;
            return;
        };
        const csrfToken = csrfResponse.headers.get('x-csrf-token');
        if (csrfToken == null) throw new Error('Unable to fetch CSRF-Token');
        
        this.csrfToken = csrfToken;
    }

    /**
     * Retries the given callback with a new CSRF token if the response has a 401 status code.
     * This is useful since Fiori does sometimes timeout the token but hasn't logged out the user.
     * @returns the original response or retried response from the callback if new token could be fetched
     * @throws if callback throws or a communication error with api occurs
     */
    private async retryWithNewTokenIf401(
        response: Response,
        callback: () => Promise<Response>,
    ): Promise<Response> {
        if (response.ok || response.status !== 401) return response;
        // token is invalid, clear it
        this.csrfToken = undefined;

        await this.fetchCSRFToken();
        if (!this.csrfToken) return response;

        return await callback();
    }

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
        if (!this.csrfToken) {
            await this.fetchCSRFToken();
            if (!this.csrfToken) return null; // logged out
        }

        let result = await this.fetchWorkingTimes(startDate, endDate);
        result = await this.retryWithNewTokenIf401(result, () =>
            this.fetchWorkingTimes(startDate, endDate),
        );

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
        const start = Formater.formatDateToYYYYMMDD(startDate);
        const end = Formater.formatDateToYYYYMMDD(endDate);
        const requestBody =
            '--batch\n' +
            'Content-Type: application/http\n' +
            'Content-Transfer-Encoding: binary\n' +
            '\n' +
            `GET TimeDataList?sap-client=300&$filter=StartDate%20eq%20%27${start}%27%20and%20EndDate%20eq%20%27${end}%27 HTTP/1.1\n` +
            'Accept: application/json\n' +
            `X-CSRF-Token: ${this.csrfToken}\n` +
            'DataServiceVersion: 2.0\n' +
            'MaxDataServiceVersion: 2.0\n' +
            'X-Requested-With: XMLHttpRequest\n' +
            '\n\n' +
            '--batch--';

        const result = await fetch(
            new Request(FetchURL.getTimeSheetFetchURL(), {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'x-csrf-token': this.csrfToken!, // token has been set above
                    Priority: 'u=4',
                    Pragma: 'no-cache',
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'multipart/mixed;boundary=batch',
                },
                body: requestBody,
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
        if (!this.csrfToken) {
            await this.fetchCSRFToken();
            if (!this.csrfToken) return null; // logged out
        }

        let result = await this.fetchEmployeeId();
        result = await this.retryWithNewTokenIf401(result, () => this.fetchEmployeeId());

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
        const requestBody =
            '--batch\n' +
            'Content-Type: application/http\n' +
            'Content-Transfer-Encoding: binary\n' +
            '\n' +
            'GET ConcurrentEmploymentSet?$filter=ApplicationId%20eq%20%27MYHRFORMS%27 HTTP/1.1\n' +
            'sap-cancel-on-close: true\n' +
            'sap-contextid-accept: header\n' +
            'Accept: application/json\n' +
            'Accept-Language: de\n' +
            'DataServiceVersion: 2.0\n' +
            'MaxDataServiceVersion: 2.0\n' +
            'X-Requested-With: XMLHttpRequest\n' +
            '\n\n' +
            '--batch--';

        const result = await fetch(
            new Request(FetchURL.getEmployeeNumberFetchURL(), {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'x-csrf-token': this.csrfToken!, // token has been set above
                    'Content-Type': 'multipart/mixed;boundary=batch',
                },
                body: requestBody,
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
        if (!this.csrfToken) {
            await this.fetchCSRFToken();
            if (!this.csrfToken) return null; // logged out
        }

        let result = await this.fetchTimeStatement(employeeNumber, startDate, endDate);
        result = await this.retryWithNewTokenIf401(result, () =>
            this.fetchTimeStatement(employeeNumber, startDate, endDate),
        );

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
