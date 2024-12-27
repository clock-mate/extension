import { isErrorData } from '../../../common/types/errorData';

export default class Formater {
    public static convertArrayBufferToBase64(buffer: ArrayBuffer): string {
        const byteArray = new Uint8Array(buffer);
        let binaryString = '';
        for (let i = 0; i < byteArray.byteLength; i++) {
            binaryString += String.fromCharCode(byteArray[i]);
        }

        return btoa(binaryString);
    }
    
    /**
     * @throws if the given object implements the `ErrorData` interface with the contained message
     */
    public static throwIfErrorMessage(data: unknown) {
        if (isErrorData(data)) {
            throw new Error(data.error.message);
        }
    }
}