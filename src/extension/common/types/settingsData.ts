/**
 * A public holiday is a holiday which is each year on the same day.
 * Therefore only the day of the month and month are relevant.
 * For holiday the american english (AE) variant is meant (compare to
 * "public holiday", "legal holiday", "bank holiday"), do not confuse with
 * the AE word vacation.
 */
export interface HalfPublicHolidaysConfig {
    enabled: boolean;
    dec24: boolean;
    dec31: boolean;
}

export function isHalfPublicHolidaysConfig(
    halfPublicHolidaysConfig: unknown,
): halfPublicHolidaysConfig is HalfPublicHolidaysConfig {
    return (
        typeof halfPublicHolidaysConfig === 'object' &&
        halfPublicHolidaysConfig !== null &&
        'enabled' in halfPublicHolidaysConfig &&
        typeof halfPublicHolidaysConfig.enabled === 'boolean' &&
        'dec24' in halfPublicHolidaysConfig &&
        typeof halfPublicHolidaysConfig.dec24 === 'boolean' &&
        'dec31' in halfPublicHolidaysConfig &&
        typeof halfPublicHolidaysConfig.dec31 === 'boolean'
    );
}

export interface SettingsData {
    displayIsEnabled: boolean;
    round5MinIsEnabled: boolean;
    halfPublicHolidaysConfig: HalfPublicHolidaysConfig;
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
        'halfPublicHolidaysConfig' in settingsData &&
        isHalfPublicHolidaysConfig(settingsData.halfPublicHolidaysConfig) &&
        'monthsToCalcManually' in settingsData &&
        typeof settingsData.monthsToCalcManually === 'number'
    );
}
