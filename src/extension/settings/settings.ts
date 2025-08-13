import browser from 'webextension-polyfill';
import Settings from '../common/utils/settings';

const PRIVACY_POLICY_BTN_ID = 'privacy-policy-btn';
const ROUND_5_MIN_CHECKBOX_ID = 'round-5-min';
const HALF_PUBLIC_HOLIDAYS_CHECKBOX_ID = 'half-public-holidays';
const HALF_PUBLIC_HOLIDAY_24_DEC_CHECKBOX_ID = 'half-public-holiday-24-dec';
const HALF_PUBLIC_HOLIDAY_31_DEC_CHECKBOX_ID = 'half-public-holiday-31-dec';
const MONTHS_TO_CALC_MANUALLY_INPUT_ID = 'months-to-calc-manually';
const MONTHS_TO_CALC_MANUALLY_TEXT_NUM_ID = 'months-to-calc-manually-text-num';

type SettingsDOMElements = {
    [PRIVACY_POLICY_BTN_ID]: HTMLButtonElement;
    [ROUND_5_MIN_CHECKBOX_ID]: HTMLInputElement;
    [HALF_PUBLIC_HOLIDAYS_CHECKBOX_ID]: HTMLInputElement;
    [HALF_PUBLIC_HOLIDAY_24_DEC_CHECKBOX_ID]: HTMLInputElement;
    [HALF_PUBLIC_HOLIDAY_31_DEC_CHECKBOX_ID]: HTMLInputElement;
    [MONTHS_TO_CALC_MANUALLY_INPUT_ID]: HTMLInputElement;
    [MONTHS_TO_CALC_MANUALLY_TEXT_NUM_ID]: HTMLSpanElement;
};

(async () => {
    'use strict';
    const domRefs = getReferencedObjects();
    await setInitialValues(domRefs); // await to prevent unnecessary state updates when updating values
    registerEvents(domRefs);
})();

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
        [MONTHS_TO_CALC_MANUALLY_INPUT_ID]: document.getElementById(
            MONTHS_TO_CALC_MANUALLY_INPUT_ID,
        ) as HTMLInputElement,
        [MONTHS_TO_CALC_MANUALLY_TEXT_NUM_ID]: document.getElementById(
            MONTHS_TO_CALC_MANUALLY_TEXT_NUM_ID,
        ) as HTMLSpanElement,
    };
}

/**
 * Set the initial values for the settings UI elements.
 */
async function setInitialValues(domRefs: SettingsDOMElements) {
    domRefs[ROUND_5_MIN_CHECKBOX_ID].checked = await Settings.round5MinIsEnabled();
    domRefs[HALF_PUBLIC_HOLIDAYS_CHECKBOX_ID].checked =
        await Settings.halfPublicHolidaysIsEnabled();
    domRefs[HALF_PUBLIC_HOLIDAY_24_DEC_CHECKBOX_ID].checked =
        await Settings.halfPublicHoliday24DecIsEnabled();
    domRefs[HALF_PUBLIC_HOLIDAY_31_DEC_CHECKBOX_ID].checked =
        await Settings.halfPublicHoliday31DecIsEnabled();
    domRefs[MONTHS_TO_CALC_MANUALLY_INPUT_ID].value = String(
        await Settings.getMonthsToCalcManually(),
    );
    domRefs[MONTHS_TO_CALC_MANUALLY_TEXT_NUM_ID].textContent = String(
        await Settings.getMonthsToCalcManually(),
    );
}

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
        handleMonthsToCalcManuallyChange(
            domRefs[MONTHS_TO_CALC_MANUALLY_INPUT_ID].value,
            domRefs[MONTHS_TO_CALC_MANUALLY_TEXT_NUM_ID],
        ),
    );
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
function handleMonthsToCalcManuallyChange(
    months: string,
    monthsToCalcManuallyTextNum: HTMLSpanElement,
) {
    const monthsNumber = Number(months);
    if (
        isNaN(monthsNumber) ||
        monthsNumber < 1 ||
        monthsNumber > 24 ||
        !Number.isInteger(monthsNumber)
    ) {
        // TODO error handling
        return;
    }
    monthsToCalcManuallyTextNum.textContent = String(monthsNumber);
    Settings.setMonthsToCalcManually(monthsNumber);
}
