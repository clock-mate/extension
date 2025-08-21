import { BackgroundCommand } from '../../../common/enums/command';
import { hasStringContent } from '../../../common/types/messageObject';
import { PDFAggregator } from '../../aggregateData';
import { ERROR_MSGS } from '../../common/constants';
import Formater from '../utils/format';

async function saveOvertimeFromPDF(message: MessageEvent) {
    let overtime;
    try {
        if (!hasStringContent(message.data)) {
            throw new Error('No message or no content received from the content script');
        }

        const pdfDocument = await PDFAggregator.compilePDF(message.data.content);
        const overtimeString = await PDFAggregator.getOvertimeFromPDF(pdfDocument);
        overtime = Formater.getNumberFromString(overtimeString);
    } catch (e) {
        postMessage({
            command: BackgroundCommand.CompileTimeStatement,
            error: { message: ERROR_MSGS.UNABLE_TO_PARSE_DATA },
            originalError: e,
        });
        return;
    }

    const overtimeMinutesRounded = Formater.roundHoursToNearest5Minutes(overtime);
    postMessage({
        // send overtime to backgroundscript since worker has no access to storage api
        overtime: overtimeMinutesRounded,
    });
}

onmessage = saveOvertimeFromPDF;
