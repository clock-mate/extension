import { PageVariant } from '../common/enums/pageVariant';
import Navigation from '../common/utils/navigation';
import Formater from './utils/format';

export default class FetchURL {
    
    private static readonly TIMESHEET_URL_PATH = '/sap/opu/odata/sap/HCM_TIMESHEET_MAN_SRV/$batch?sap-client=300';
    private static readonly EMPLOYEE_NUMBER_URL_PATH = '/sap/opu/odata/sap/HCMFAB_COMMON_SRV/$batch';
    private static readonly TIMESTATEMENT_URL_PATH_FORMAT 
        = "/sap/opu/odata/sap/HCMFAB_MYFORMS_SRV/FormDisplaySet(EmployeeNumber='{employeeNumber}',FormType='SAP_INT_TIM_STM',ParametersValues='BEGDA%3D{startDate}%40%3BENDDA%3D{endDate}')/$value";
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
         * @returns the URL to fetch the API
         */
        public static getTimeSheetFetchURL(): string {
            return this.getFetchDomain() + this.TIMESHEET_URL_PATH;
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
            return (
                this.getFetchDomain() +
                this.TIMESTATEMENT_URL_PATH_FORMAT
                    .replace('{employeeNumber}', employeeNumber)
                    .replace('{startDate}', Formater.formatDateToYYYYMMDD(startDate))
                    .replace('{endDate}', Formater.formatDateToYYYYMMDD(endDate))
            );
        }
}