import { DisplayFormat } from '../../common/types/display';
import OvertimeManager from '../../getOvertime/overtimeManager';
import { REFRESH_ICON_ID } from './constants';

export default class ReloadHandler {
    constructor(
        private overtimeManager: OvertimeManager,
        private displayState: DisplayFormat,
    ) {}

    /**
     * Registers the click event on the reload button of the display.
     */
    public registerReloadEventListener() {
        const refreshIcon = document.getElementById(REFRESH_ICON_ID);
        if (!refreshIcon) return; // unable to add event listener

        refreshIcon.addEventListener('click', () => {
            this.overtimeManager.reloadOvertimeData(this.displayState);
        });
    }
}
