import browser from 'webextension-polyfill';

export default class Settings {
    /* =======================================================================================
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Display Enabled <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
    public static async displayIsEnabled(): Promise<boolean> {
        try {
            const result = await browser.storage.local.get({ displayIsEnabled: true });
            if (result.displayIsEnabled == null) {
                return true; // default to true
            }

            return Boolean(result.displayIsEnabled);
        } catch {
            return true; // default to true even on error
        }
    }

    public static async setDisplayEnabled(state: boolean) {
        return await browser.storage.local.set({ displayIsEnabled: state });
    }

    /* =======================================================================================
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Round 5 min <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
    public static async round5MinIsEnabled(): Promise<boolean> {
        try {
            const result = await browser.storage.local.get({ round5MinIsEnabled: true });
            if (result.round5MinIsEnabled == null) {
                return false; // default to false
            }

            return Boolean(result.round5MinIsEnabled);
        } catch {
            return false; // default to false even on error
        }
    }

    public static async setRound5MinEnabled(state: boolean) {
        return await browser.storage.local.set({ round5MinIsEnabled: state });
    }

}
