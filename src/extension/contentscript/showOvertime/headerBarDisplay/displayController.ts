import { DisplayFormat } from '../../common/types/display';
import Navigation from '../../common/utils/navigation';
import View from '../view';

export default class DisplayController {
    private observer: MutationObserver;

    constructor(
        private displayState: DisplayFormat,
        private headerBar: HTMLElement,
        private view: View
    ) {
        this.observer = new MutationObserver(() => this.placeOrRemoveDisplay());
    }

    public initialize() {
        // liste for hash changes (URL navigation)
        window.addEventListener('hashchange', () => this.placeOrRemoveDisplay());

        // check if the HeaderBar is being manipulated -> Fiori does sometimes remove the inserted display
        // start observing the DOM
        this.observer.observe(this.headerBar, {
            // config
            attributes: false,
            childList: true,
            subtree: true,
        });

        // perform the initial display setup
        this.placeOrRemoveDisplay();
    }

    // stop observing / clean up
    public disconnect(): void {
        window.removeEventListener('hashchange', () => this.placeOrRemoveDisplay());
        this.observer.disconnect();
    }

    private placeOrRemoveDisplay = async () => {
        if (Navigation.checkCorrectMenuIsOpen()) {
            this.view.renderDisplay(this.displayState, false);
        } else if (!Navigation.checkCorrectMenuIsOpen()) {
            // this will also be removed by Fiori but keep remove just in case this behaviour gets changed
            View.removeDisplay();
        }
    };
}
