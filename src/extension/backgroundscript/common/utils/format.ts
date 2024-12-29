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
}