import browser from 'webextension-polyfill';

interface HalfPublicHolidaysConfig {
    enabled: boolean;
    dec24: boolean;
    dec31: boolean;
}

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
            const result = await browser.storage.local.get({ round5MinIsEnabled: false });
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

    /* =======================================================================================
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Public holidays <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
    private static getDefaultHalfPublicHolidaysConfig(): HalfPublicHolidaysConfig {
        return {
            enabled: true,
            dec24: true,
            dec31: true
        };
    }

    private static async getHalfPublicHolidaysConfig(): Promise<HalfPublicHolidaysConfig> {
        try {
            const result = await browser.storage.local.get({ 
                halfPublicHolidaysConfig: this.getDefaultHalfPublicHolidaysConfig() 
            });
            return result.halfPublicHolidaysConfig as HalfPublicHolidaysConfig || this.getDefaultHalfPublicHolidaysConfig();
        } catch {
            return this.getDefaultHalfPublicHolidaysConfig();
        }
    }

    public static async halfPublicHolidaysIsEnabled(): Promise<boolean> {
        const config = await this.getHalfPublicHolidaysConfig();
        return config.enabled;
    }

    public static async setHalfPublicHolidaysEnabled(state: boolean) {
        const config = await this.getHalfPublicHolidaysConfig();
        config.enabled = state;
        return await browser.storage.local.set({ halfPublicHolidaysConfig: config });
    }

    public static async halfPublicHoliday24DecIsEnabled(): Promise<boolean> {
        const config = await this.getHalfPublicHolidaysConfig();
        return config.dec24;
    }

    public static async setHalfPublicHoliday24DecEnabled(state: boolean) {
        const config = await this.getHalfPublicHolidaysConfig();
        config.dec24 = state;
        return await browser.storage.local.set({ halfPublicHolidaysConfig: config });
    }

    public static async halfPublicHoliday31DecIsEnabled(): Promise<boolean> {
        const config = await this.getHalfPublicHolidaysConfig();
        return config.dec31;
    }

    public static async setHalfPublicHoliday31DecEnabled(state: boolean) {
        const config = await this.getHalfPublicHolidaysConfig();
        config.dec31 = state;
        return await browser.storage.local.set({ halfPublicHolidaysConfig: config });
    }

}
