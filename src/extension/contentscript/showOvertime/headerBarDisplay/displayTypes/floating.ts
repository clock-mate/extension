import { ReloadHandler } from '../';
import Settings from '../../../../common/utils/settings';
import { DisplayFormat } from '../../../common/types/display';
import Navigation from '../../../common/utils/navigation';
import { CSS_CLASSES, FLOATING_DISPLAY_ID } from '../../constants';
import Common from './common';

/**
 * The floating display is an HTML-Element which is floating above all other page
 * content and not properly part of it. It should be used as an initial display while
 * the page is loading.
 */
export default class Floating {
    private static readonly MAIN_PAGE_ELEMENT_1 = 'shellLayout';
    private static readonly  MAIN_PAGE_ELEMENT_2 = 'canvas';

    constructor(private reloadHandler: ReloadHandler) {}

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
            document.getElementById(Floating.MAIN_PAGE_ELEMENT_1) ??
            document.getElementById(Floating.MAIN_PAGE_ELEMENT_2);
        if (!canvas) return; // unable to insert floating display, when canvas not available

        canvas.insertAdjacentElement(
            'beforebegin',
            Common.createRichElement(
                'div',
                {
                    class:
                        `${CSS_CLASSES.FLOATING_DISPLAY} ${Navigation.getPageVariant().toString().toLowerCase()} ` +
                        Common.getLightingClassName(Common.getLightingMode()) +
                        ` ${displayState.loading ? CSS_CLASSES.LOADING : ''}`,
                    id: FLOATING_DISPLAY_ID,
                },
                ...HTMLElements, // spread syntax to expand array
            ),
        );
        this.reloadHandler.registerReloadEventListener();
    }

    public static getFloatingDisplay(): HTMLElement | null {
        return document.getElementById(FLOATING_DISPLAY_ID);
    }

    public static removeFloatingDisplay() {
        const oldDisplay = this.getFloatingDisplay();
        if (oldDisplay) oldDisplay.remove(); // delete the old display
    }


}
