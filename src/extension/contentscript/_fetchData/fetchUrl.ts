import Navigation from '../utils/navigation';
import { PageVariant } from '../enums/pageVariant';
import { givenStrings } from '../utils/constants';
import Formater from '../utils/format';

export default class FetchURL {
    /**
         * Checks if the currently open page is supported by the extension.
         * @returns true if the page is supported
         */
        public static pageIsSupported(): boolean {
            if (
                Navigation.getPageVariant() == PageVariant.Internal ||
                window.location.origin.includes(givenStrings.externalURLSupported)
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
            return this.getFetchDomain() + givenStrings.timeSheetURLPath;
        }
    
        public static getEmployeeNumberFetchURL(): string {
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
        public static getTimeStatementFetchURL(
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
}