import browser from 'webextension-polyfill';
import SimpleManager from '../common/interfaces/simpleManager';
import { DisplayFormat } from '../common/types/display';
import { View } from '../showOvertime';

export default class SettingsSync implements SimpleManager {
    constructor(
        public view: View,
        private displayState: DisplayFormat,
    ) {}

    public initialize() {
        return;
    }

    public async performAction() {
        this.updateDisplayOnDisplayEnabledChange();
    }

    public updateDisplayOnDisplayEnabledChange() {
        browser.storage.local.onChanged.addListener((changes: browser.Storage.StorageChange) => {
            if (isDisplayEnabledChange(changes)) {
                this.addOrRemoveDisplay(changes.displayIsEnabled.newValue);
            }
        });
    }

    private async addOrRemoveDisplay(displayIsEnabled: boolean) {
        if (displayIsEnabled) {
            this.view.renderDisplay(this.displayState);
            return;
        }
        View.removeDisplay();
    }
}

interface DisplayEnabledChange {
    displayIsEnabled: {
        newValue: boolean;
    };
}

function isDisplayEnabledChange(
    displayEnabledChange: unknown,
): displayEnabledChange is DisplayEnabledChange {
    return (
        typeof displayEnabledChange === 'object' &&
        displayEnabledChange !== null &&
        'displayIsEnabled' in displayEnabledChange &&
        displayEnabledChange.displayIsEnabled !== null &&
        typeof displayEnabledChange.displayIsEnabled == 'object' &&
        'newValue' in displayEnabledChange.displayIsEnabled &&
        typeof displayEnabledChange.displayIsEnabled.newValue === 'boolean'
    );
}
