import * as pdfjsLib from 'pdfjs-dist';

// path is relative to the worker which calls the pdf manager -> timeStatementWorker
pdfjsLib.GlobalWorkerOptions.workerSrc = '../pdf.worker.min.mjs';

export default class PDFAggregator {
    private static readonly OVERTIME_STRING = {
        en: 'Total Flextime Balance',
        de: 'GLZ-Saldo aktuell',
    };
    /**
     * When the fetched pdf document does not have a value for overtime (e.g. no working times available for fetched period)
     * this is the string of the next entry.
     */
    private static readonly NEXT_ITEM_STRING = {
        en: 'Overtime Remuneration',
        de: 'Über-/Unterdeckung',
    };

    public static async compilePDF(message: MessageEvent): Promise<pdfjsLib.PDFDocumentProxy> {
        if (!('content' in message.data) || typeof message.data.content !== 'string') {
            throw new Error('No message or no content received from the content script');
        }

        return pdfjsLib.getDocument({ data: atob(message.data.content) }).promise;
    }

    public static async getOvertimeFromPDF(
        pdfDocument: pdfjsLib.PDFDocumentProxy,
    ): Promise<string> {
        const amountPages = pdfDocument.numPages;

        // loop over all pages in the pdf
        for (let currentPageNum = 1; currentPageNum <= amountPages; currentPageNum++) {
            const page = await pdfDocument.getPage(currentPageNum);
            const textContent = await page.getTextContent();

            // loop over all entries in the page
            for (let i = 0; i < textContent.items.length; i++) {
                const item = textContent.items[i];
                if (!('str' in item)) continue;
                if (item.str !== this.OVERTIME_STRING.de && item.str !== this.OVERTIME_STRING.en) {
                    continue;
                }

                // the overtime string is not the next element since that is always a space
                const overtimeItem = textContent.items[i + 2];
                if (!('str' in overtimeItem) || overtimeItem.str.trim().length == 0) {
                    throw new Error(
                        'Overtime is not present at expected item. Found instead: ' + overtimeItem,
                    );
                }
                if (
                    overtimeItem.str === this.NEXT_ITEM_STRING.de ||
                    overtimeItem.str === this.NEXT_ITEM_STRING.en
                ) {
                    // no overtime available for time period (e.g. new employee) -> assume 0 as overtime
                    return '0';
                }

                return overtimeItem.str;
            }
        }
        throw new Error(`No matching items found in the PDF on a total of ${amountPages} pages`);
    }
}
