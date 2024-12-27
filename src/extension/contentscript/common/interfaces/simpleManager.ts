/**
 * Interface for classes with a fire and forget logic which manage some state
 * or data.
 */
export default interface SimpleManager {
    initialize(): void;
    performAction(): Promise<void>;
}
