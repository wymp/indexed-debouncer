import { DebouncerInterface } from "./Types";
import { DebouncedFunc } from "./DebouncedFunc";

export class Debouncer<Contract extends { [k in string]: any } = { [k in string]: any }>
  implements DebouncerInterface<Contract> {
  protected cache: { [K in keyof Contract]?: DebouncedFunc<Contract[K]> } = {}

  public constructor(protected defaultWaitMs: number = 15) {}

  /** @inheritDoc */
  public bounce<K extends keyof Contract = string>(
    key: K,
    func: () => Contract[K] | Promise<Contract[K]>,
    waitMs?: number,
  ): Promise<"canceled" | Contract[K]> {
    let debouncedFunc = <DebouncedFunc<Contract[K]> | undefined>this.cache[key];
    if (!debouncedFunc || debouncedFunc.status !== "waiting") {
      debouncedFunc = new DebouncedFunc<Contract[K]>(
        typeof waitMs === "number" ? waitMs : this.defaultWaitMs
      );
      this.cache[key] = debouncedFunc;
    }
    return debouncedFunc!.bounce(func);
  }
}

