import Settings from '../common/utils/settings';

const STATUS_TEXT_ID = 'status-text';

async function onReady() {
    initializeEnabledCheck();
}

async function initializeEnabledCheck() {
    const checkbox: HTMLInputElement | null = document.querySelector('input[name=on-off-switch]');

    if (checkbox && 'checked' in checkbox) {
        checkbox.addEventListener('change', async () => {
            const statusTextElement = document.getElementById(STATUS_TEXT_ID);
            if (checkbox.checked) {
                await Settings.setDisplayEnabled(true);

                if (statusTextElement) {
                    statusTextElement.innerText = 'aktiviert';
                }
            } else {
                await Settings.setDisplayEnabled(false);

                if (statusTextElement) {
                    statusTextElement.innerText = 'deaktiviert';
                }
            }
        });

        if (!(await Settings.displayIsEnabled())) {
            checkbox.checked = false;

            const statusTextElement = document.getElementById(STATUS_TEXT_ID);
            if (statusTextElement) {
                statusTextElement.innerText = 'deaktiviert';
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', onReady);
