declare global {
    interface Array<T> {
        forEachAsync<S>(
            iterator: (this: S, value: T, index: number, array: this) => Promise<void>,
            thisArg?: S
        ): Promise<void>;
    }
}

Array.prototype.forEachAsync = function<S, T>(
    iterator: (this: S, value: T, index: number, array: Array<T>) => Promise<void>,
    thisArg?: S
) {
    return Promise.all(this.map(iterator, thisArg))
        .then(() => undefined);
};

export {};
