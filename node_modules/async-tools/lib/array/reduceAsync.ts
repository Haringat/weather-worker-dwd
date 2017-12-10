declare global {
    interface Array<T> {
        reduceAsync(
            callback: (accumulator: T, currentValue: T, currentIndex: number, array: Array<T>) => Promise<T>
        ): Promise<T>;
        reduceAsync<U>(
            callback: (accumulator: U, currentValue: T, currentIndex: number, array: Array<T>) => Promise<U>,
            initialValue?: U
        ): Promise<U>;
    }
}

Array.prototype.reduceAsync = function<T, U>(
    callback: (accumulator: U, currentValue: T, currentIndex: number, array: Array<T>) => Promise<U>,
    initialValue?: U
) {
    if (initialValue !== undefined) {
        return this.reduce((acculator, currentValue, currentIndex, array) => {
            return acculator.then((value) => {
                return callback(value, currentValue, currentIndex, array);
            });
        }, Promise.resolve(initialValue));
    } else {
        return this.slice(1).reduceAsync(callback, this[0]);
    }
};

export {};
