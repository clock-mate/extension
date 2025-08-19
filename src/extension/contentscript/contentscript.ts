import { ErrorData } from '../common/types/errorData';
import { OvertimeData } from '../common/types/overtimeData';
import config from './common/config.json';
import { DISPLAY_TEXTS } from './common/constants';
import StatusedPromise from './common/models/statusedPromise';
import { DisplayFormat } from './common/types/display';
import Formater from './common/utils/format';
import Navigation from './common/utils/navigation';
import { BackgroundComm } from './communication/';
import { FetchData } from './fetchData';
import FetchURL from './fetchData/fetchUrl';
import { OvertimeManager } from './getOvertime';
import { SettingsSync } from './settingsSync';
import { View } from './showOvertime';
import { DisplayManager } from './showOvertime/headerBarDisplay';

(async () => {
    'use strict';

    // ===== Initialize communication and fetch data =====
    const backgroundComm = new BackgroundComm();
    const fetchData = new FetchData();
    const overtimeManager = new OvertimeManager(backgroundComm, fetchData);

    let calculatedData: StatusedPromise<Promise<OvertimeData | ErrorData>>;
    if (FetchURL.pageIsSupported()) {
        calculatedData = new StatusedPromise(overtimeManager.calculateNewOvertimeData());
    } else {
        calculatedData = Formater.createUnsupportedPageData();
    }

    // ===== Wait for correct page to be opened =====
    await Navigation.continuousMenucheck();
    await Navigation.waitForDOMContentLoaded();

    // ===== Add display =====
    /** Used accross the whole contentscript to synchronize retrieved and displayed data. */
    const displayState: DisplayFormat = {
        text: DISPLAY_TEXTS.PREFIX_OVERTIME + DISPLAY_TEXTS.OVERTIME_LOADING,
        loading: true,
    };
    const view = new View(overtimeManager, displayState);
    overtimeManager.view = view;
    view.renderDisplay(displayState); // render initial, loading display

    // ===== Register settings sync =====
    const settingsSync = new SettingsSync(view, displayState);
    settingsSync.updateDisplayOnDisplayEnabledChange();

    // ===== Register actions for promises resolving =====
    // update the display as soon as new data is available
    calculatedData.promise.then(async () => {
        Formater.updateDisplayState(
            displayState,
            await Formater.getLatestDisplayFormat(calculatedData),
        );
        view.renderDisplay(displayState);
    });

    // ===== Update display when the site changes =====
    try {
        const headerBar = await Navigation.waitForPageLoad(
            config.pageloadingTimeout,
            config.maxPageloadingLoops,
        );
        view.headerBar = headerBar;

        const displayManager = new DisplayManager(displayState, headerBar, view);
        displayManager.initialize();
        displayManager.performAction();
    } catch (e) {
        View.removeDisplay(); // TODO show error in popup
        console.error(e);
    }
})();
