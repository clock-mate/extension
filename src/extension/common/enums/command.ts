/**
 * Commands which are understood and accepted by the background script. Any other commands
 * are not accepted.
 */
export enum BackgroundCommand {
    ParseTimeSheet,
    ParsePlannedHours,
    CompileTimeStatement,
    ParseEmployeeId,
    /** From the previously given data calculate the overtime and return it */
    GetOvertime,
}
