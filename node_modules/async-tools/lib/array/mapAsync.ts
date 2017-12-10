declare global {
    interface Array<T> {
        mapAsync<S, U>(
            iterator: (this: S, value: T, index: number, array: this) => Promise<U>,
            thisArg?: S
        ): Promise<Array<U>>;
    }
}

Array.prototype.mapAsync = function<S, T, U>(
    iterator: (this: S, value: T, index: number, array: Array<T>) => Promise<U>,
    thisArg?: S
) {
    return Promise.all<U>(this.map(iterator, thisArg));
};

export {};
