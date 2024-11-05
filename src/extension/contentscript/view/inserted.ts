import { constStrings } from '../utils/constants';
import Navigation from '../utils/navigation';
import Common from './common';
import Settings from '../../common/utils/settings';
import { DisplayFormat } from '../types/display';
import OvertimeManager from '../utils/overtimeManager';

/**
 * The inserted display is an HTML-Element which is placed inside 
 * of the header of the page. It shows the current information for
 * the overtime. 
 */
export default class Inserted {
    constructor(public overtimeManager: OvertimeManager) {}

    public async addInsertedDisplay(
        headerBar: HTMLElement,
        displayState: DisplayFormat
    ) {
        if (!(await Settings.displayIsEnabled())) return;

        const HTMLElements = Common.createInnerHTMLElements(displayState.text, displayState.loading, true);

        headerBar.prepend(
            Common.createRichElement(
                'div',
                {
                    class:
                        `${constStrings.cssClasses.insertedDisplay} ${Navigation.getPageVariant().toString().toLowerCase()} ` +
                        Common.getLightingClassName(Common.getLightingMode()),
                    id: constStrings.insertedDisplayID,
                    style: displayState.loading ? ' opacity: 0.5;' : '',
                },
                ...HTMLElements, // spread syntax to expand array
            ),
        );
        // readd reload event listener
        const refreshIcon = document.getElementById(constStrings.refreshIconID);
        if (!refreshIcon) return; // unable to add event listener
        refreshIcon.addEventListener('click', () => {
            this.overtimeManager.reloadOvertimeData(displayState);
        });
    }

    public static getInsertedDisplay(): HTMLElement | null {
        return document.getElementById(constStrings.insertedDisplayID);
    }

    public static removeInsertedDisplay() {
        const previousInsertedDisplay = this.getInsertedDisplay();
        if (previousInsertedDisplay) {
            previousInsertedDisplay.remove();
        }
    }
}
