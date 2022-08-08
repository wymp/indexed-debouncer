Indexed Debouncer
=======================================================================

A class that can be instantiated as a global dependency and which can keep track of named debounces
across various disparate execution calls. This was built specifically to address React component
mount/unmount chaos, in which a "normal" debounce function wouldn't work because it is being
instantiated as a new instance every execution.

Note: Detailed library API docs are available in this repo at `/docs/index.html`.


## Usage

The primary export of this library is the [`Debouncer` class](classes/Debouncer.html).

**Note: `Debouncer` has a default wait time of 15ms. This may be changed globally by passing a
different default in the `Debouncer` constructor, or it may be changed per-invocation by passing a
wait time as the last parameter of `bounce`.**

To use, first create a global instance of `Debouncer`, then use the `bounce` method of that instance
to debounce functions. Each invocation of `bounce` with a given name will return a new promise that
resolves to either `canceled`, if that particular invocation was canceled, or the return value of
the function if that instance ends up actually firing. (Any errors cause the promise to reject, as
one might expect.)

You may use this to selectively update state only for successfully debounced actions.

For example:

```ts
import { Debouncer } from "@wymp/indexed-debouncer";
import { useEffect, useState } from "react";

const debouncer = new Debouncer();

// React component
const App = (p: { debouncer: Debouncer }) => {
  const [status, setStatus] = useState<"init"|"ready">("init");

  useEffect(() => {
    debouncer
      .bounce("init-app", () => console.log("do thing"), 20)
      .then(result => {
        if (result !== "canceled") {
          setStatus("ready");
        }
      });
  });

  return <div>
    <p>{status === "init" ? "Initializing" : "Ready!"}</p>
  </div>
}
```

If for some reason you'd like to use the raw `DebounceFunc`, you may do that as well:

```ts
import { DebounceFunc } from "@wymp/indexed-debouncer";

const func = new DebounceFunc(30);

const promises: Array<Promise<"canceled" | number>> = [
  func.bounce(() => 1),
  func.bounce(() => 2),
  func.bounce(() => 3),
  func.bounce(() => 4),
];

Promise.all(promises).then(console.log);

// Outputs the following:
//
// [ "canceled", "canceled", "canceled", 4 ]
//
```


### Advanced Types

This library will work without any type parameters specified. However, there is a risk of using
overlapping keys that can lead to unexpected results.

To avoid this, you can pass a `Contract` type parameter to the `Debouncer` constructor. This will
enforce that you may only use one of the specified keys on bounces, and that the function you pass
must conform to the type specified for that key. For example:

```ts
type Contract = {
  "init-app": { status: "init" | "loading" | "ready" };
  "init-mod-1": { thing: unknown };
  "init-mod-2": void;
}
const debouncer = new Debouncer<Contract>();
```

In the above example, you may ONLY call `bounce` on this instance with one of the three keys
specified, and the function you pass to `bounce` _must_ return the type indicated for that key (or
a promise returning that type). For example, the following would both throw a type error:

```ts
debouncer.bounce("init-app", () => true);
debouncer.bounce("non-existent", () => ({ status: "ready" }));
```


## Development

1. run `npm install`
2. Make code changes
3. run `npx tsc`
4. Make logical, specific commits

