import test from "ava";
import "./mapAsync";

test("works on empty arrays", async (t) => {
    t.plan(2);
    const originalArray = [];
    const results = await originalArray.mapAsync(async () => {
        t.fail("callback called on empty array.");
    });
    t.deepEqual(results, []);
    t.not(results, originalArray);
});

test("waits for all callbacks before continuing", async (t) => {
    t.plan(5);
    let completed = 0;
    await [1, 2, 3, 4].mapAsync(async (value) => {
        t.pass();
        await new Promise((resolve) => {
            setTimeout(() => {
                completed++;
                resolve();
            }, value * 1000);
        });
    });
    if (completed === 4) {
        t.pass();
    } else {
        t.fail("did not wait for all asynchronous callbacks to finish");
    }
});

test("passes all parameters into callback", async (t) => {
    t.plan(12);
    const originalArray = [1, 2, 3, 4];
    await originalArray.mapAsync(async (value, index, array) => {
        switch (value) {
            case 1:
                t.is(value, 1);
                t.is(index, 0);
                t.is(array, originalArray);
                break;
            case 2:
                t.is(value, 2);
                t.is(index, 1);
                t.is(array, originalArray);
                break;
            case 3:
                t.is(value, 3);
                t.is(index, 2);
                t.is(array, originalArray);
                break;
            case 4:
                t.is(value, 4);
                t.is(index, 3);
                t.is(array, originalArray);
                break;
            default:
                t.fail(`unexpected value "${value}" passed in for first parameter`);
        }
    });
});

test("passes in thisArg properly", async (t) => {
    t.plan(1);
    const thisArg = {};
    // noinspection TsLint (we need the function for this to work)
    await [1].mapAsync(async function() {
        t.is(this, thisArg);
    }, thisArg);
});

test("returns callback return values in a new array", async (t) => {
    t.plan(2);
    const originalArray = [1, 2, 3, 4];
    const results = await originalArray.mapAsync(async (value) => value ** value);
    t.deepEqual(originalArray, [1, 2, 3, 4]);
    t.deepEqual(results, [1, 4, 27, 256]);
});
