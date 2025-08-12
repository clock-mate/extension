import browser from 'webextension-polyfill';
import Settings from '../common/utils/settings';

const PRIVACY_POLICY_BTN_ID = 'privacy-policy-btn';
const ROUND_5_MIN_CHECKBOX_ID = 'round-5-min';
const HALF_PUBLIC_HOLIDAYS_CHECKBOX_ID = 'half-public-holidays';
const HALF_PUBLIC_HOLIDAY_24_DEC_CHECKBOX_ID = 'half-public-holiday-24-dec';
const HALF_PUBLIC_HOLIDAY_31_DEC_CHECKBOX_ID = 'half-public-holiday-31-dec';
const MONTHS_TO_CALC_MANUALLY_INPUT_ID = 'months-to-calc-manually';

type SettingsDOMElements = {
    [PRIVACY_POLICY_BTN_ID]: HTMLButtonElement;
    [ROUND_5_MIN_CHECKBOX_ID]: HTMLInputElement;
    [HALF_PUBLIC_HOLIDAYS_CHECKBOX_ID]: HTMLInputElement;
    [HALF_PUBLIC_HOLIDAY_24_DEC_CHECKBOX_ID]: HTMLInputElement;
    [HALF_PUBLIC_HOLIDAY_31_DEC_CHECKBOX_ID]: HTMLInputElement;
    [MONTHS_TO_CALC_MANUALLY_INPUT_ID]: HTMLInputElement;
};

(() => {
    'use strict';
    const domRefs = getReferencedObjects();
    registerEvents(domRefs);
})();

/**
 * The script execution policy of the extension does not allow calling JS
 * methods from the extension page. Just register all events here.
 */
function registerEvents(domRefs: SettingsDOMElements) {
    domRefs[PRIVACY_POLICY_BTN_ID].addEventListener('click', handlePrivacyPolicyClick);
    domRefs[ROUND_5_MIN_CHECKBOX_ID].addEventListener('change', () =>
        handleRound5MinChange(domRefs[ROUND_5_MIN_CHECKBOX_ID].checked),
    );
    domRefs[HALF_PUBLIC_HOLIDAYS_CHECKBOX_ID].addEventListener('change', () =>
        handleHalfPublicHolidaysChange(domRefs[HALF_PUBLIC_HOLIDAYS_CHECKBOX_ID].checked),
    );
    domRefs[HALF_PUBLIC_HOLIDAY_24_DEC_CHECKBOX_ID].addEventListener('change', () =>
        handleHalfPublicHoliday24DecChange(domRefs[HALF_PUBLIC_HOLIDAY_24_DEC_CHECKBOX_ID].checked),
    );
    domRefs[HALF_PUBLIC_HOLIDAY_31_DEC_CHECKBOX_ID].addEventListener('change', () =>
        handleHalfPublicHoliday31DecChange(domRefs[HALF_PUBLIC_HOLIDAY_31_DEC_CHECKBOX_ID].checked),
    );
    domRefs[MONTHS_TO_CALC_MANUALLY_INPUT_ID].addEventListener('change', () =>
        handleMonthsToCalcManuallyChange(domRefs[MONTHS_TO_CALC_MANUALLY_INPUT_ID].value),
    );
}

/**
 * Get references to important DOM elements.
 */
function getReferencedObjects(): SettingsDOMElements {
    return {
        [PRIVACY_POLICY_BTN_ID]: document.getElementById(
            PRIVACY_POLICY_BTN_ID,
        ) as HTMLButtonElement,
        [ROUND_5_MIN_CHECKBOX_ID]: document.getElementById(
            ROUND_5_MIN_CHECKBOX_ID,
        ) as HTMLInputElement,
        [HALF_PUBLIC_HOLIDAYS_CHECKBOX_ID]: document.getElementById(
            HALF_PUBLIC_HOLIDAYS_CHECKBOX_ID,
        ) as HTMLInputElement,
        [HALF_PUBLIC_HOLIDAY_24_DEC_CHECKBOX_ID]: document.getElementById(
            HALF_PUBLIC_HOLIDAY_24_DEC_CHECKBOX_ID,
        ) as HTMLInputElement,
        [HALF_PUBLIC_HOLIDAY_31_DEC_CHECKBOX_ID]: document.getElementById(
            HALF_PUBLIC_HOLIDAY_31_DEC_CHECKBOX_ID,
        ) as HTMLInputElement,
        [MONTHS_TO_CALC_MANUALLY_INPUT_ID]: document.getElementById(MONTHS_TO_CALC_MANUALLY_INPUT_ID) as HTMLInputElement,
    };
}

/* ========================================================================
    >>>>>>>>>>>>>>>>>>>> Event Handlers <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

function handlePrivacyPolicyClick() {
    browser.tabs.create({ url: 'privacy-policy.html' });
}
function handleRound5MinChange(state: boolean) {
    Settings.setRound5MinEnabled(state);
}
function handleHalfPublicHolidaysChange(state: boolean) {
    Settings.setHalfPublicHolidaysEnabled(state);
}
function handleHalfPublicHoliday24DecChange(state: boolean) {
    Settings.setHalfPublicHoliday24DecEnabled(state);
}
function handleHalfPublicHoliday31DecChange(state: boolean) {
    Settings.setHalfPublicHoliday31DecEnabled(state);
}
function handleMonthsToCalcManuallyChange(months: string) {
    const monthsNumber = Number(months);
    if (isNaN(monthsNumber) || monthsNumber < 1 || monthsNumber > 24 || !Number.isInteger(monthsNumber)) {
        // TODO error handling
        return;
    }
    Settings.setMonthsToCalcManually(monthsNumber);
}
