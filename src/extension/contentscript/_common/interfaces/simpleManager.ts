export default interface SimpleManager {
    initialize(): void;
    performAction(): Promise<void>;
}