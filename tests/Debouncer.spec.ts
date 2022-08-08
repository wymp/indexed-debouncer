import { Debouncer, DebouncerInterface } from "../src";

describe("Debouncer", () => {
  // Create a new Debouncer instance for each test
  let d: DebouncerInterface;
  beforeEach(() => d = new Debouncer());

  test(
    "debounces function, resolving 'canceled' for instances that were canceled and replaced",
    async () => {
      const p: Array<Promise<number | "canceled">> = [];
      p.push(d.bounce("my-func", () => 1, 20));
      p.push(d.bounce("my-func", () => 2, 20));
      p.push(d.bounce("my-func", () => 3, 20));

      expect(await Promise.all(p)).toMatchObject(["canceled", "canceled", 3]);
    }
  );

  ["during","after"].map(when => {
    test(`creates new instance when called ${when} execution`, async () => {
      const one = d.bounce(
        "my-func",
        () => new Promise(res => setTimeout(() => res(1), when === "during" ? 15 : 2)),
        1
      );
      await new Promise(res => setTimeout(res, 8));
      expect(await Promise.all([one, d.bounce("my-func", () => 2, 1)])).toMatchObject([1,2]);
    });
  })

  test("works with complex type parameter", async () => {
    const d = new Debouncer<{
      "init-app": { status: boolean };
      "init-mod-1": void;
    }>();
    const val = { status: true };
    // Uncomment to test typings
    //expect(await d.bounce("init-app", 5, () => 1)).toBe(1);
    //expect(await d.bounce("non-existent", 5, () => val)).toMatchObject(val);
    expect(await d.bounce("init-app", () => val, 2)).toMatchObject(val);
    expect(await d.bounce("init-mod-1", () => { /* return void */ }, 2)).toBe(undefined);
  });

  test("can set default wait time", async () => {
    const d = new Debouncer(50);
    const one = d.bounce("my-func", () => 1);
    await new Promise(res => setTimeout(res, 45));
    const two = d.bounce("my-func", () => 2);
    expect(await Promise.all([one,two])).toMatchObject(["canceled",2]);
  });
});
