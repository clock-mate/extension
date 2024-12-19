import Formater from '../utils/format';
import FetchURL from './fetchUrl';


/**
 * Takes care of any communication via the network. For example fetching data from APIs.
 */
export default class FetchData {
    private csrfToken: string | undefined;

    /**
     * Contacts the API to get the current CSRF token. The token can be used to
     * make future POST requests to the API.
     * @returns the CSRF token
     * @throws if the token is not sent by the API
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
        const csrfToken = csrfResponse.headers.get('x-csrf-token');
        if (csrfToken) return (this.csrfToken = csrfToken);

        throw new Error('Unable to fetch CSRF-Token');
    }

    /**
     * Contacts the API to get the working times response. The given start- and enddate
     * will be used for the request. The response will be the data returned by the api. This data
     * contains the working times but has to be formatted to be able to use them.
     * @param startDate    the first day to fetch working times for (time is ignored)
     * @param endDate      the last day to fetch working times for, has to be the same or after `startDate` (time is ignored)
     * @returns an unformatted response with the working times
     * @throws if the endDate is not after the startDate
     * @throws if a communication error with api occurs
     */
    public async fetchWorkingTimes(startDate: Date, endDate: Date): Promise<string> {
        if (startDate > endDate || startDate.getDate() > endDate.getDate()) {
            throw new Error('End date is not after start date');
        }
        if (!this.csrfToken) {
            await this.fetchCSRFToken();
        }

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
                    'x-csrf-token': this.csrfToken!, // token has been set above or error was thrown
                    Priority: 'u=4',
                    Pragma: 'no-cache',
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'multipart/mixed;boundary=batch',
                },
                body: requestBody,
            }),
        );

        if (!result.ok) {
            throw new Error(
                'Unexpected API response while fetching working times! Received status code: ' +
                    result.status,
            );
        }
        return result.text();
    }

    /**
     * Contacts the API to get a response including the employee id.
     * The response will be the data returned by the api. This data
     * contains the employee id but has to be formatted to be able to use it.
     * @returns an unformatted response with the employee id
     * @throws if a communication error with api occurs
     */
    public async fetchEmployeeId() {
        if (!this.csrfToken) {
            await this.fetchCSRFToken();
        }

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
                    'x-csrf-token': this.csrfToken!, // token has been set above or error was thrown
                    'Content-Type': 'multipart/mixed;boundary=batch',
                },
                body: requestBody,
            }),
        );

        if (!result.ok) {
            throw new Error(
                'Unexpected API response while fetching employee id! Received status code: ' +
                    result.status,
            );
        }
        return result.text();
    }

    /**
     * Contact the API to get the time statement for the given start- and enddate. The response
     * will be the data returned by the api. This has to be compiled to a pdf to be able to use it.
     * @param employeeNumber    the number of the employee to fetch the time statement from
     * @param startDate         the first day of the time statement (time is ignored)
     * @param endDate           the last day of the time statement (time is ignored)
     * @returns the unformatted data of the time statement pdf
     * @throws if the endDate is not after the startDate
     * @throws if a communication error with api occurs
     */
    public async fetchTimeStatement(
        employeeNumber: string,
        startDate: Date,
        endDate: Date,
    ): Promise<ArrayBuffer> {
        if (startDate > endDate || startDate.getDate() > endDate.getDate()) {
            throw new Error('End date is not after start date');
        }

        const result = await fetch(
            FetchURL.getTimeStatementFetchURL(employeeNumber, startDate, endDate),
        );

        if (!result.ok) {
            throw new Error(
                'Unexpected API response while fetching time statement! Received status code: ' +
                    result.status,
            );
        }
        return result.arrayBuffer();
    }
}
