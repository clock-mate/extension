export default class ErrorHandling {
    /**
     * Checks if the the given data has the `originalError` attribute and prints it.
     */
    public static printPossibleError(data: object) {
        if ('originalError' in data) {
            console.error(data.originalError);
        }
    }
}
