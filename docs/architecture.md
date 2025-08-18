# Architecture

This document provides an overview of the anatomy of the browser extension and exchanged messages between different parts. The parts relevant for the overtime calculation are the [Contentscript](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts), [Backgroundscript](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts) and [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers).

## Content Script (CS)

The content script runs in the context of the Fiori page. It is responsible for

1. Showing and updating the display inside the page, since this can only be done within the context of the page
2. Fetching data, since it can use the cookie credentials of the page without reading them

Any calculations or parsing is offloaded and not done here. See `src/extension/contentscript/contentscript.ts`.

## Background script (BS)

The background script mostly functions as a message relay. It can start new web workers (can not be done from the content script) which run in their own thread and execution context. The background script will forward messages to the web workers. See `src/extension/backgroundscript/backgroundscript.ts`.

## Web workers (WW)

These perform the more computational expensive tasks since they can run in a separate thread. See `src/extension/backgroundscript/workeres/webWorkers`.

## Exchanged messages

All communication is initiated by the CS. CS and BS only exchange `MessageObjects`. The message objects holds different commands which are forwarded by BS to according WW. WW sends custom object with expected data back. BS sends success message as `BackgroundResponse` optionally with the data.
```
Content Script ---- Background Script ---- Web worker
        <-MessageObject->          MessageObject->
                                     <-custom

Commands:
     ParseTimeSheet      ->            ->
        <- BackgroundResponse          <- overtime
           (no data)

     CompileTimeSatement ->            ->
        <- BackgroundResponse          <- overtime
           (no data)

     ParseEmployeeId     ->            ->
        <- BackgroundRespone           <- EmployeeIdData
           (with EmployeeIdData)

     GetOvertime         
        <- BackgroundRespone
           (with OvertimeData)    
```
On Chromium browsers an offscreen page is placed between the BS and WW and just forwards all messages in each direction. Some data has to be manipulated for it to be forwarded, for example the WW does not receive the full MessageObject. See [worker readme](../src/extension/backgroundscript/workers/chromium/README.md).

TODO document error messages communication
