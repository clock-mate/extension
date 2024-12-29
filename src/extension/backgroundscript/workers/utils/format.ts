export default class Formater {
    /**
     * The start of the JSON for the working times. The JSON is expected to start with
     * an object 'd' holding an object 'results' which holds an array.
     */
    private static readonly JSON_START_STRING: '{"d":{"results":[';
    /**
     * The end of the JSON for the working times. The JSON is expected to end with
     * closing the previously openend array and objects, followed by a newline (CRLF).
     */
    private static readonly JSON_END_STRING: ']}}\r\n';

    /**
     * Retreives the JSON object inside the API data. Unecessary extra inforamtion
     * is removed and the JSON extracted.
     * @param data    the unformatted API data holding the expected JSON
     * @returns the retreived JSON object
     * @throws if the data can't be parsed for any reason
    */
    public static getJSONFromAPIData(data: string): object {
        const startIndex = data.indexOf(this.JSON_START_STRING);
        if (startIndex === -1) {
            throw new Error('Unable to find start of JSON');
        }

        const endIndex = data.indexOf(this.JSON_END_STRING);
        if (endIndex === -1) {
            throw new Error('Unable to find end of JSON');
        }

        // + length to include the closing brackets
        const jsonString = data.slice(startIndex, endIndex + this.JSON_END_STRING.length);

        return JSON.parse(jsonString);
    }

    /**
     * Takes a string which will be converted into a number. The string maybe an empty or whitespace only
     * string then 0 will be returned. The string may use `,` or `.` as a decimal point.
     * @returns the number or 0
     * @throws if the input is not a number
     */
    public static getNumberFromString(input: string): number {
        if (input.trim().length == 0) {
            return 0;
        }
        // remove any spaces in the string (allow space between "-" and number)
        const number = Number(input.replace(/\s+/g, '').replace(',', '.'));
        if (Number.isNaN(number)) {
            throw new Error(
                'Invalid input string which does not represent a number. Received: ' + input,
            );
        }
        return number;
    }

    /**
     * Takes the hours and calculates the minutes rounded to the nearest 5 min.
     * @param hours the hours to convert, may be floating point, e.g.: 1.57
     * @returns integer minutes, e.g.: 95
    */
    public static roundHoursToNearest5Minutes(hours: number): number {
        const minutes = hours * 60;
        return Math.round(minutes / 5) * 5;
    }
}