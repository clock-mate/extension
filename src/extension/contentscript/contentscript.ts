import { config, constStrings } from './utils/constants';
import View from './view/view';
import Inserted from './view/inserted';
import BackgroundComm from './communication/backgroundComm';
import NetworkComm from './communication/networkComm';
import Navigation from './utils/navigation';
import Formater from './utils/format';
import SettingsSync from './utils/settingsSync';
import StatusedPromise from './model/statusedPromise';
import { DisplayFormat } from './types/display';
import OvertimeManager from './utils/overtimeManager';
import Floating from './view/floating';
import { ErrorData } from '../common/types/errorData';
import { OvertimeData } from '../common/types/overtimeData';

(async () => {
    'use strict';

    /* ==========================================================================================
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Main Events <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

    // ===== Start sending all requests =====
    const backgroundComm = new BackgroundComm();
    const networkComm = new NetworkComm();
    const overtimeManager = new OvertimeManager(backgroundComm, networkComm);

    let calculatedData: StatusedPromise<Promise<OvertimeData | ErrorData>>;
    if (NetworkComm.pageIsSupported()) {
        calculatedData = new StatusedPromise(overtimeManager.calculateNewOvertimeData());
    } else {
        calculatedData = Formater.createUnsupportedPageData();
    }

    // ===== Wait for correct page to be opened =====
    await Navigation.continuousMenucheck();
    await Navigation.waitForDOMContentLoaded();

    // ===== Add floating display =====
    /** Used accross the whole content script to synchronize retrieved and displayed data. */
    const displayState: DisplayFormat = {
        text: constStrings.prefixOvertime + constStrings.overtimeLoading,
        loading: true,
    };
    const floating = new Floating(overtimeManager);
    const inserted = new Inserted(overtimeManager);
    const view = new View(floating, inserted);
    view.renderDisplay(displayState); // render initial floating, loading display

    // ===== Register settings sync =====
    const settingsSync = new SettingsSync(view);
    settingsSync.updateDisplayOnDisplayEnabledChange(displayState);

    // ===== Register actions for promises resolving =====
    // update the display as soon as new data is available
    calculatedData.promise.then(async () => {
        Formater.updateDisplayState(
            displayState,
            await Formater.getLatestDisplayFormat(calculatedData),
        );
        view.renderDisplay(displayState);
    });

    try {
        const headerBar = await Navigation.waitForPageLoad(
            config.pageloadingTimeout,
            config.maxPageloadingLoops,
        );
        view.headerBar = headerBar;
        view.renderDisplay(displayState);
        updateDisplayOnChange(headerBar, displayState, view);
    } catch (e) {
        View.removeDisplay(); // TODO show error in popup
        console.error(e);
    }
})();
