import { ReloadHandler } from '../';
import Settings from '../../../../common/utils/settings';
import { DisplayFormat } from '../../../common/types/display';
import Navigation from '../../../common/utils/navigation';
import { CSS_CLASSES, INSERTED_DISPLAY_ID } from '../../constants';
import Common from './common';

/**
 * The inserted display is an HTML-Element which is placed inside
 * of the header of the page. It shows the current information for
 * the overtime.
 */
export default class Inserted {
    constructor(public reloadHandler: ReloadHandler) {}

    public async addInsertedDisplay(headerBar: HTMLElement, displayState: DisplayFormat) {
        if (!(await Settings.displayIsEnabled())) return;

        const HTMLElements = Common.createInnerHTMLElements(
            displayState.text,
            displayState.loading,
        );

        headerBar.prepend(
            Common.createRichElement(
                'div',
                {
                    class:
                        `${CSS_CLASSES.INSERTED_DISPLAY} ${Navigation.getPageVariant().toString().toLowerCase()} ` +
                        Common.getLightingClassName(Common.getLightingMode()) +
                        ` ${displayState.loading ? CSS_CLASSES.LOADING : ''}`,
                    id: INSERTED_DISPLAY_ID,
                },
                ...HTMLElements, // spread syntax to expand array
            ),
        );
        this.reloadHandler.registerReloadEventListener();
    }

    public static getInsertedDisplay(): HTMLElement | null {
        return document.getElementById(INSERTED_DISPLAY_ID);
    }

    public static removeInsertedDisplay() {
        const previousInsertedDisplay = this.getInsertedDisplay();
        if (previousInsertedDisplay) {
            previousInsertedDisplay.remove();
        }
    }


}
