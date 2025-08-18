import { OffscreenCommand } from '../../backgroundscript/workers/chromium/enums/offscreenCommand';
import { BackgroundCommand } from '../enums/command';
import { isSettingsData, SettingsData } from './settingsData';

/**
 * This type is used to exchange messages in a unified way between
 * content scripts, background scripts, offscreen documents/workers.
 */
export interface MessageObject {
    command: BackgroundCommand | OffscreenCommand;
    content?: unknown;
    settings?: SettingsData;
}

export function isMessageObject(messageObject: unknown): messageObject is MessageObject {
    return (
        typeof messageObject === 'object' &&
        messageObject !== null &&
        'command' in messageObject &&
        (typeof messageObject.command === 'number' || typeof messageObject.command === 'string') &&
        (Object.values(BackgroundCommand).includes(messageObject.command) ||
            Object.values(OffscreenCommand).includes(messageObject.command)) &&
        ('settings' in messageObject && messageObject.settings !== undefined // when defined, check if valid
            ? isSettingsData(messageObject.settings)
            : true)
    );
}
