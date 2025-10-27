import browser from 'webextension-polyfill';
import { HalfPublicHolidaysConfig, SettingsData } from '../types/settingsData';

export default class Settings {
    private static readonly DEFAULT_DISPLAY_IS_ENABLED = true;
    private static readonly DEFAULT_ROUND_5_MIN_IS_ENABLED = false;
    private static readonly DEFAULT_HALF_PUBLIC_HOLIDAYS_CONFIG: HalfPublicHolidaysConfig = {
        enabled: true,
        dec24: true,
        dec31: true,
    };
    private static readonly DEFAULT_MONTHS_TO_CALCULATE_MANUALLY = 3;

    // ===== Display enabled =====
    public static async displayIsEnabled(): Promise<boolean> {
        try {
            const result = await browser.storage.local.get({
                displayIsEnabled: this.DEFAULT_DISPLAY_IS_ENABLED,
            });
            if (result.displayIsEnabled == null) {
                return this.DEFAULT_DISPLAY_IS_ENABLED;
            }

            return Boolean(result.displayIsEnabled);
        } catch {
            return this.DEFAULT_DISPLAY_IS_ENABLED;
        }
    }

    public static async setDisplayEnabled(state: boolean) {
        return await browser.storage.local.set({ displayIsEnabled: state });
    }

    // ===== Round 5 min =====
    public static async round5MinIsEnabled(): Promise<boolean> {
        try {
            const result = await browser.storage.local.get({
                round5MinIsEnabled: this.DEFAULT_ROUND_5_MIN_IS_ENABLED,
            });
            if (result.round5MinIsEnabled == null) {
                return this.DEFAULT_ROUND_5_MIN_IS_ENABLED;
            }

            return Boolean(result.round5MinIsEnabled);
        } catch {
            return this.DEFAULT_ROUND_5_MIN_IS_ENABLED;
        }
    }

    public static async setRound5MinEnabled(state: boolean) {
        return await browser.storage.local.set({ round5MinIsEnabled: state });
    }

    // ===== Public holidays =====
    public static async getHalfPublicHolidaysConfig(): Promise<HalfPublicHolidaysConfig> {
        try {
            const result = await browser.storage.local.get({
                halfPublicHolidaysConfig: this.DEFAULT_HALF_PUBLIC_HOLIDAYS_CONFIG,
            });
            return (
                (result.halfPublicHolidaysConfig as HalfPublicHolidaysConfig) ||
                this.DEFAULT_HALF_PUBLIC_HOLIDAYS_CONFIG
            );
        } catch {
            return this.DEFAULT_HALF_PUBLIC_HOLIDAYS_CONFIG;
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

    // ===== Months to calculate manually =====
    public static async getMonthsToCalcManually(): Promise<number> {
        try {
            const result = await browser.storage.local.get({
                monthsToCalcManually: this.DEFAULT_MONTHS_TO_CALCULATE_MANUALLY,
            });
            return Number(result.monthsToCalcManually) || this.DEFAULT_MONTHS_TO_CALCULATE_MANUALLY;
        } catch {
            return this.DEFAULT_MONTHS_TO_CALCULATE_MANUALLY;
        }
    }

    public static async setMonthsToCalcManually(months: number) {
        return await browser.storage.local.set({ monthsToCalcManually: months });
    }

    // ===== Full settings =====
    public static async getFullSettings(): Promise<SettingsData> {
        // TODO could be optimized to only make on call to the storage API
        return {
            displayIsEnabled: await this.displayIsEnabled(),
            round5MinIsEnabled: await this.round5MinIsEnabled(),
            halfPublicHolidaysConfig: await this.getHalfPublicHolidaysConfig(),
            monthsToCalcManually: await this.getMonthsToCalcManually(),
        };
    }
}
