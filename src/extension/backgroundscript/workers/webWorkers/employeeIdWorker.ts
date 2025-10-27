import { hasStringContent } from '../../../common/types/messageObject';
import { ERROR_MSGS } from '../../common/constants';
import EmployeeData from '../../common/models/employeeData';
import Formater from '../utils/format';

async function sendBackEmployeeId(message: MessageEvent) {
    let employeeId: string;

    try {
        if (!hasStringContent(message.data)) {
            throw new Error('No message or no content received from the content script');
        }

        const jsonObject = Formater.getJSONFromAPIData(message.data.content);
        const employeeData = EmployeeData.fromObject(jsonObject);
        employeeId = employeeData.d.results[0].employeeId;
        if (!employeeId || employeeId.trim() === '') {
            throw new Error('No employee ID in API data');
        }
    } catch (e) {
        postMessage({
            error: { message: ERROR_MSGS.UNABLE_TO_PARSE_DATA },
            originalError: e,
        });
        return;
    }

    postMessage({
        employeeId: employeeId,
    });
}

onmessage = sendBackEmployeeId;
