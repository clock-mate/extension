import { givenStrings } from '../utils/constants';
import Formater from '../utils/format';
import Navigation from '../utils/navigation';
import { PageVariant } from '../enums/pageVariant';

/**
 * Takes care of any communication via the network. For example fetching data from APIs.
 */
export default class NetworkComm {
    private csrfToken: string | undefined;

    /**
     * Gets the domain for the API to fetch the data from, based on the currently open page.
     * The external URL for fetching data is different from the currently open page
     * on some page variants.
     */
    private static getFetchDomain(): string {
        if (
            Navigation.getPageVariant() == PageVariant.Internal ||
            window.location.origin.includes(givenStrings.externalURLInsert)
        ) {
            return window.location.origin;
        }
        // user is on external page which is missing the URLInsert part
        const fixedURLOrigin = window.location.origin.replace(
            givenStrings.externalURLInsertAfter,
            givenStrings.externalURLInsertAfter + givenStrings.externalURLInsert,
        );
        return fixedURLOrigin;
    }

    /**
     * Determines the URL which should be used to fetch the API for the latest time sheet.
     * @returns the URL to fetch the API
     */
    private static getTimeSheetFetchURL(): string {
        return this.getFetchDomain() + givenStrings.timeSheetURLPath;
    }

    private static getEmployeeNumberFetchURL(): string {
        return this.getFetchDomain() + givenStrings.employeeNumberURLPath;
    }

    /**
     * Determines the URL which should be used to fetch the API for the time statement
     * with the given time frame.
     * @param employeeNumber    the number of the employee to fetch the time statement from
     * @param startDate         the first day of the time statement (time is ignored)
     * @param endDate           the last day of the time statement (time is ignored)
     * @returns the URL to fetch the API
     */
    private static getTimeStatementFetchURL(
        employeeNumber: string,
        startDate: Date,
        endDate: Date,
    ): string {
        return (
            this.getFetchDomain() +
            givenStrings.timeStatementURLPathFormat
                .replace('{employeeNumber}', employeeNumber)
                .replace('{startDate}', Formater.formatDateToYYYYMMDD(startDate))
                .replace('{endDate}', Formater.formatDateToYYYYMMDD(endDate))
        );
    }

    /**
     * Contacts the API to get the current CSRF token. The token can be used to
     * make future POST requests to the API.
     * @returns the CSRF token
     * @throws if the token is not sent by the API
     */
    private async fetchCSRFToken() {
        const csrfResponse = await fetch(
            new Request(NetworkComm.getTimeSheetFetchURL(), {
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
            new Request(NetworkComm.getTimeSheetFetchURL(), {
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
            new Request(NetworkComm.getEmployeeNumberFetchURL(), {
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
            NetworkComm.getTimeStatementFetchURL(employeeNumber, startDate, endDate),
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
