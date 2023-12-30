import { DebouncedFunc } from "../src";

describe("DebouncedFunc", () => {
  test("debounces function, resolving 'canceled' for instances that were canceled and replaced", async () => {
    const func = new DebouncedFunc<number>(10);
    const p: Array<Promise<number | "canceled">> = [];
    p.push(func.bounce(() => 1));
    p.push(func.bounce(() => 2));
    p.push(func.bounce(() => 3));

    expect(await Promise.all(p)).toMatchObject(["canceled", "canceled", 3]);
  });

  test("can cancel execution", async () => {
    const func = new DebouncedFunc<number>(10);
    const p = func.bounce(() => 1);
    func.cancel();
    expect(await p).toBe("canceled");
  });

  test("immediately cancels new bounces after function has fired", async () => {
    const func = new DebouncedFunc<number>(10);
    await func.bounce(() => 1);
    expect(await func.bounce(() => 2)).toBe("canceled");
  });

  test("works without type parameter", async () => {
    const func = new DebouncedFunc(10);
    expect(await func.bounce(() => 1)).toBe(1);
  });

  test("works with complex type parameter", async () => {
    const func = new DebouncedFunc<{ myVal: { status: boolean } }>(10);
    // Uncomment to test typings
    //expect(await func.bounce(() => 1)).toBe(1);
    const val = { myVal: { status: true } };
    expect(await func.bounce(() => val)).toMatchObject(val);
  });
});
