export interface SettingsData {
    displayIsEnabled: boolean;
    round5MinIsEnabled: boolean;
    monthsToCalcManually: number;
}

export function isSettingsData(settingsData: unknown): settingsData is SettingsData {
    return (
        typeof settingsData === 'object' &&
        settingsData !== null &&
        'displayIsEnabled' in settingsData &&
        typeof settingsData.displayIsEnabled === 'boolean' &&
        'round5MinIsEnabled' in settingsData &&
        typeof settingsData.round5MinIsEnabled === 'boolean' &&
        'monthsToCalcManually' in settingsData &&
        typeof settingsData.monthsToCalcManually === 'number'
    );
}
