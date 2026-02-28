import { PageVariant } from '../common/enums/pageVariant';
import Navigation from '../common/utils/navigation';
import Formater from './utils/format';

export default class FetchURL {
    private static readonly TIMESHEET_URL_PATH =
        '/sap/opu/odata/sap/HCM_TIMESHEET_MAN_SRV/TimeDataList' +
        '?$filter=StartDate%20eq%20%27{start}%27%20and%20EndDate%20eq%20%27{end}%27' +
        '&$select=FieldName,FieldValue&$format=json';
    private static readonly WORK_CALENDAR_URL_PATH =
        '/sap/opu/odata/sap/HCM_TIMESHEET_MAN_SRV/WorkCalendars' +
        '?$filter=Pernr%20eq%20%27{pernr}%27%20and%20StartDate%20eq%20%27{start}%27%20and%20EndDate%20eq%20%27{end}%27' +
        '&$select=Date,TargetHours&$format=json';
    private static readonly EMPLOYEE_NUMBER_URL_PATH =
        '/sap/opu/odata/sap/HCMFAB_COMMON_SRV/ConcurrentEmploymentSet' +
        '?$select=EmployeeId&$top=1&$format=json';
    private static readonly TIMESTATEMENT_URL_PATH_FORMAT =
        "/sap/opu/odata/sap/HCMFAB_MYFORMS_SRV/FormDisplaySet(EmployeeNumber='{employeeNumber}',FormType='SAP_INT_TIM_STM',ParametersValues='BEGDA%3D{startDate}%40%3BENDDA%3D{endDate}')/$value";
    /** This part of the url indicates if the website is supported */
    private static readonly EXTERNAL_URL_SUPPORTED = '-sapdelim-fesruntime';

    /**
     * Checks if the currently open page is supported by the extension.
     * @returns true if the page is supported
     */
    public static pageIsSupported(): boolean {
        if (
            Navigation.getPageVariant() == PageVariant.Internal ||
            window.location.origin.includes(this.EXTERNAL_URL_SUPPORTED)
        ) {
            return true;
        }
        return false;
    }

    /**
     * Gets the domain for the API to fetch the data from, based on the currently open page.
     */
    private static getFetchDomain(): string {
        return window.location.origin;
    }

    /**
     * Determines the URL which should be used to fetch the API for the latest time sheet.
     * @param startDate the first day of the time sheet (time is ignored)
     * @param endDate   the last day of the time sheet (time is ignored)
     * @returns the URL to fetch the API
     */
    public static getTimeSheetFetchURL(startDate: Date, endDate: Date): string {
        const start = Formater.formatDateToYYYYMMDD(startDate);
        const end = Formater.formatDateToYYYYMMDD(endDate);
        return (
            this.getFetchDomain() +
            this.TIMESHEET_URL_PATH.replace('{start}', start).replace('{end}', end)
        );
    }

    /**
     * Determines the URL which should be used to fetch the API for the planned hours.
     * @param employeeNumber    the employee number to fetch the planned hours for
     * @param startDate         the first day of the work calendar (time is ignored)
     * @param endDate           the last day of the work calendar (time is ignored)
     * @returns the URL to fetch the API
     */
    public static getWorkCalendarFetchURL(employeeNumber: string, startDate: Date, endDate: Date): string {
        const start = Formater.formatDateToYYYYMMDD(startDate);
        const end = Formater.formatDateToYYYYMMDD(endDate);
        return (
            this.getFetchDomain() +
            this.WORK_CALENDAR_URL_PATH.replace('{pernr}', employeeNumber)
                .replace('{start}', start)
                .replace('{end}', end)
        );
    }

    public static getEmployeeNumberFetchURL(): string {
        return this.getFetchDomain() + this.EMPLOYEE_NUMBER_URL_PATH;
    }

    /**
     * Determines the URL which should be used to fetch the API for the time statement
     * with the given time frame.
     * @param employeeNumber    the number of the employee to fetch the time statement from
     * @param startDate         the first day of the time statement (time is ignored)
     * @param endDate           the last day of the time statement (time is ignored)
     * @returns the URL to fetch the API
     */
    public static getTimeStatementFetchURL(
        employeeNumber: string,
        startDate: Date,
        endDate: Date,
    ): string {
        const start = Formater.formatDateToYYYYMMDD(startDate);
        const end = Formater.formatDateToYYYYMMDD(endDate);
        return (
            this.getFetchDomain() +
            this.TIMESTATEMENT_URL_PATH_FORMAT.replace('{employeeNumber}', employeeNumber)
                .replace('{startDate}', start)
                .replace('{endDate}', end)
        );
    }
}
