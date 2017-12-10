import test from "ava";
import "./forEachAsync";

test("works on empty arrays", async (t) => {
    t.plan(0);
    await [].forEachAsync(async () => {
        t.fail("callback called on empty array.");
    });
});

test("waits for all callbacks before continuing", async (t) => {
    t.plan(5);
    let completed = 0;
    await [1, 2, 3, 4].forEachAsync(async (value) => {
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
    await originalArray.forEachAsync(async (value, index, array) => {
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
    await [1].forEachAsync(async function() {
        t.is(this, thisArg);
    }, thisArg);
});
