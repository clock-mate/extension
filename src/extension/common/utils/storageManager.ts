import browser from 'webextension-polyfill';
import DaySummary from '../../backgroundscript/common/models/daySummary';

export default class StorageManager {
    public static async getDaySummaries(): Promise<Record<string, DaySummary> | null> {
        try {
            const result = await browser.storage.local.get('daySummaries');
            return (result.daySummaries as Record<string, DaySummary>) ?? null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    public static async saveDaySummaries(summaries: Record<string, DaySummary>) {
        await browser.storage.local.set({ daySummaries: summaries });
    }

    public static async getPlannedMinutesPerDay(): Promise<Record<string, number> | null> {
        try {
            const result = await browser.storage.local.get('plannedMinutesPerDay');
            return (result.plannedMinutesPerDay as Record<string, number>) ?? null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    public static async savePlannedMinutesPerDay(map: Record<string, number>) {
        await browser.storage.local.set({ plannedMinutesPerDay: map });
    }

    public static async getTimeStatementOvertime(): Promise<string | unknown> {
        try {
            const result = await browser.storage.local.get('timeStatementOvertime');
            return result.timeStatementOvertime;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    public static async saveTimeStatementOvertime(overtime: number) {
        await browser.storage.local.set({ timeStatementOvertime: overtime });
    }

    public static async getCachedEmployeeId(): Promise<string | null> {
        try {
            const result = await browser.storage.local.get('cachedEmployeeId');
            return (result.cachedEmployeeId as string) ?? null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    public static async saveCachedEmployeeId(id: string) {
        await browser.storage.local.set({ cachedEmployeeId: id });
    }
}
