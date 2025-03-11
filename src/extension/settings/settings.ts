import browser from 'webextension-polyfill';

document.getElementById('privacy-policy-btn')!.addEventListener('click', openPrivacyPolicy);

function openPrivacyPolicy() {
    browser.tabs.create({ url: 'privacy-policy.html' });
}
