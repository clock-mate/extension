import { constStrings, givenStrings } from '../utils/constants';
import Navigation from '../utils/navigation';
import Common from './common';
import Settings from '../../common/utils/settings';
import { DisplayFormat } from '../types/display';
import OvertimeManager from '../utils/overtimeManager';

/**
 * The floating display is an HTML-Element which is floating above all other page
 * content and not properly part of it. It should be used as an initial display while
 * the page is loading.
 */
export default class Floating {
    constructor(public overtimeManager: OvertimeManager) {}

    public async addFloatingDisplay(displayState: DisplayFormat) {
        if (!(await Settings.displayIsEnabled())) {
            return;
        }

        const HTMLElements = Common.createInnerHTMLElements(
            displayState.text,
            displayState.loading,
        );

        // main page element is the (almost) only one loaded when DOM is loaded
        const canvas =
            document.getElementById(givenStrings.mainPageElement1) ??
            document.getElementById(givenStrings.mainPageElement2);
        if (!canvas) return; // unable to insert floating display, when canvas not available

        canvas.insertAdjacentElement(
            'beforebegin',
            Common.createRichElement(
                'div',
                {
                    class:
                        `${constStrings.cssClasses.floatingDisplay} ${Navigation.getPageVariant().toString().toLowerCase()} ` +
                        Common.getLightingClassName(Common.getLightingMode()) +
                        ` ${displayState.loading ? constStrings.cssClasses.loading : ''}`,
                    id: constStrings.floatingDisplayID,
                },
                ...HTMLElements, // spread syntax to expand array
            ),
        );
        this.registerReloadEventListener(displayState);
    }

    public static getFloatingDisplay(): HTMLElement | null {
        return document.getElementById(constStrings.floatingDisplayID);
    }

    public static removeFloatingDisplay() {
        const oldDisplay = this.getFloatingDisplay();
        if (oldDisplay) oldDisplay.remove(); // delete the old display
    }

    /**
     * Registers the click event on the reload button of the floating display.
     */
    private registerReloadEventListener(displayState: DisplayFormat) {
        const refreshIcon = document.getElementById(constStrings.refreshIconID);
        if (!refreshIcon) return; // unable to add event listener

        refreshIcon.addEventListener('click', () => {
            this.overtimeManager.reloadOvertimeData(displayState);
        });
    }
}
