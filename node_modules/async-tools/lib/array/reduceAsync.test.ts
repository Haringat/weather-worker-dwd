import test from "ava";
import "./reduceAsync";

test("works with initialValue", async (t) => {
    t.plan(1);
    const result = await ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"].reduceAsync(async (a, b) => {
        a[b] = b.charCodeAt(0);
        return a;
    }, {});
    t.deepEqual(result, {
        a: 97,
        b: 98,
        c: 99,
        d: 100,
        e: 101,
        f: 102,
        g: 103,
        h: 104,
        i: 105,
        j: 106
    });
});

test("works without initialValue", async (t) => {
    t.plan(1);
    const result = await [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduceAsync(async (a, b) => a + b);
    t.is(result, 55);
});
