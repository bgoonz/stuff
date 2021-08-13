import { Event, Emitter } from "./event";
export interface Disposable {
    /**
     * Dispose this object.
     */
    dispose(): void;
}
export declare namespace Disposable {
    function create(func: () => void): Disposable;
    const NULL: Disposable;
}
export declare class DisposableCollection implements Disposable {
    protected readonly disposables: Disposable[];
    protected readonly onDisposeEmitter: Emitter<void>;
    get onDispose(): Event<void>;
    protected checkDisposed(): void;
    get disposed(): boolean;
    dispose(): void;
    push(disposable: Disposable): Disposable;
    pushAll(disposables: Disposable[]): Disposable[];
}
//# sourceMappingURL=disposable.d.ts.map