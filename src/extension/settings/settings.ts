import browser from 'webextension-polyfill';

const PRIVACY_POLICY_BTN_ID = 'privacy-policy-btn';

(() => {
    'use sctrict';
    registerEvents();
})();

/**
 * The script execution policy of the extension does not allow calling JS
 * methods from the extension page. Just register all events here.
 */
function registerEvents() {
    document
        .getElementById(PRIVACY_POLICY_BTN_ID)!
        .addEventListener('click', handlePrivacyPolicyClick);
}

/* ========================================================================
    >>>>>>>>>>>>>>>>>>>> Event Handlers <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

function handlePrivacyPolicyClick() {
    browser.tabs.create({ url: 'privacy-policy.html' });
}
