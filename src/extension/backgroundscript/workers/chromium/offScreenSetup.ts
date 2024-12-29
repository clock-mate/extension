import browser from 'webextension-polyfill';
// disable this rule since a type checking on the chrome variable would not make much sense
// we just don't have any types for Chromium specific features
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any;


/**
 * Allows easy usage of workers in Firefox and Chromium browsers.
 */
export default class OffScreenSetup {
    public static creating: Promise<void> | null; // a global promise to avoid concurrency issues

    /**
     * Makes sure the offscreen document is created. Should only be called in a Chromium context
     * since the `chrome` variable will be used.
     * @see https://developer.chrome.com/docs/extensions/reference/api/offscreen#maintain_the_lifecycle_of_an_offscreen_document
     */
    public static async setupOffscreenDocument(path: string) {
        // check all windows controlled by the service worker to see if one
        // of them is the offscreen document with the given path
        const offscreenUrl = browser.runtime.getURL(path);

        const existingContexts = await chrome.runtime.getContexts({
            contextTypes: ['OFFSCREEN_DOCUMENT'],
            documentUrls: [offscreenUrl],
        });

        if (existingContexts.length > 0) {
            return;
        }

        // create offscreen document
        if (OffScreenSetup.creating) {
            await OffScreenSetup.creating;
        } else {
            OffScreenSetup.creating = chrome.offscreen.createDocument({
                url: path,
                reasons: [chrome.offscreen.Reason.WORKERS],
                justification: 'Create Workers to optimize extension performance.',
            });
            await OffScreenSetup.creating;
            OffScreenSetup.creating = null;
        }
    }
}

