import { DebouncedFuncInterface, DebouncedFuncStatuses } from "./Types";

/**
 * @inheritDoc
 */
export class DebouncedFunc<T> implements DebouncedFuncInterface<T> {
  private _status: DebouncedFuncStatuses = "waiting";
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private promise:
    | null
    | { resolve: (val: "canceled" | T) => void; reject: (e: Error) => void }
    = null;

  public constructor(protected waitMs: number) {}

  public bounce(f: () => T | Promise<T>): Promise<"canceled" | T> {
    // If a previous attempt has already begun executing (or finished), just return "canceled"
    if (this._status !== "waiting") {
      return Promise.resolve("canceled");
    }

    // Clear existing timeout, if applicable
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }

    // Resolve existing promise with "canceled", if applicable
    if (this.promise) {
      this.promise.resolve("canceled");
    }

    // Create a new promise and timeout
    return new Promise<"canceled" | T>((res, rej) => {
      this.promise = { resolve: res, reject: rej };
      this.timeout = setTimeout(() => {
        // On execute, set status to executing
        this._status = "executing";
        try {
          // Run the function, resolving with the result
          res(f());
        } catch (e) {
          // Reject our promise on error
          rej(e);
        } finally {
          this._status = "done";
        }
      }, this.waitMs);
    });
  }

  public get status() {
    return this._status;
  }

  public cancel() {
    this.promise && this.promise.resolve("canceled");
    this._status = "done";
  }
}

