/** A generic debounce contract. See {@link DebouncerInterface} for more information. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericDebouncerContract = { [k in string]: any };

/**
 * An indexed debouncer that can be used to debounce calls from various distinct locations in a
 * codebase.
 *
 * @typeParam Contract An optional parameter specifying the acceptable named keys for this
 * debouncer instance and the values those keys must return. This allows you to maintain a
 * centralized library of debouncable items and their return values, which can help to eliminate
 * accidental overlap. For example, you may accidentally call `debouncer.bounce("init", ...)` in
 * multiple different components, and doing so would yield undesireable results since each call
 * might inadvertently cancel a call from an unrelated component (and with unrelated results).
 */
export interface DebouncerInterface<Contract extends GenericDebouncerContract = GenericDebouncerContract> {
  /**
   * Executes the given function after the given wait time.
   *
   * @typeParam K The key you're using for this bounce. The key must be defined in the class's
   * Contract, and the function you pass must return the value specified in the Contract for the
   * given key. This parameter is not meant to be passed directly, but is instead inferred from the
   * passed `key` param.
   * @param key The string key indentifying this debounce (e.g. load prefs from storage)
   * @param func The function to execute. Whatever this function returns will be the return value
   * of the promise if it is not canceled.
   * @param waitMs How long to wait after the last registered debounce before executing func. If not
   * specified, the internal default will be used. This default may be set on construct by passing a
   * number value to the constructor.
   * @returns A promise that resolves to the return value of the passed function, or the special
   * string value "canceled" if this particular instance of the debounce was canceled by another
   * call.
   */
  bounce<K extends keyof Contract = string>(
    key: K,
    func: () => Contract[K] | Promise<Contract[K]>,
    waitMs?: number
  ): Promise<"canceled" | Contract[K]>;
}

/**
 * A debounceable function. To use, instantiate and then call "bounce" every time the function is
 * triggered:
 *
 * ```ts
 * const myFunc = new DebouncedFunc(60);
 *
 * const p: Array<Promise<"canceled" | number>> = [];
 * for (let i = 0; i < 5; i++) {
 *   p.push(myFunc.bounce(() => i));
 * }
 *
 * console.log(Proimse.all(p));
 *
 * // Output:
 * // [ "canceled", "canceled", "canceled", "canceled", 4]
 * ```
 *
 * @typeParam T The return type of the function to be passed to `bounce`.
 */
export interface DebouncedFuncInterface<T> {
  status: DebouncedFuncStatuses;
  bounce(f: () => T | Promise<T>): Promise<"canceled" | T>;
  cancel(): void;
}

/**
 * Statuses for a debounced function
 */
export type DebouncedFuncStatuses = "waiting" | "executing" | "done";
