import { OffScreenSetup, WorkerWrapper } from './chromium';

/**
 * Allows easy usage of workers in Firefox and Chromium browsers.
 */
export default class CompatabilityLayer {
    // paths are not relative but start at the extension folder (build output)
    private static readonly OFFSCREEN_DOCUMENT_PATH = 'backgroundscript/chromium/offscreen.html';

    /**
     * Creates a Worker when available or starts a Worker in an offscreen page alternatively.
     * Messages from the offscreen worker will not respond with full MessageEvents but only the
     * data attribute, e.g. `{ data: 'any data' }`
     * @returns a new Worker or WorkerWrapper
     * @see WorkerWrapper
     */
    public static async createWorker(scriptURL: string): Promise<Worker> {
        if (typeof Worker !== 'undefined') {
            // workers are available
            return new Worker(scriptURL);
        }

        // will only happen in a Chromium context
        await OffScreenSetup.setupOffscreenDocument(this.OFFSCREEN_DOCUMENT_PATH);

        return new WorkerWrapper(scriptURL);
    }
}
