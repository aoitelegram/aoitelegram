import { Context } from "./Context";
import { AoijsError } from "./classes/AoiError";

type EnvFunction = (ctx: Context) => any;
class Environment {
  #cache = new Map<string, any>();
  #constant = new Map<string, boolean>();
  constructor(private parent?: Environment) {
    if (parent && !(parent instanceof Environment))
      throw new Error("parent env must be instanceof Environment!");
  }
  set(name: string, value: EnvFunction): any;
  /**
   * Sets a key-value into #cache
   * @param name
   * @param value
   * @returns
   */
  set(name: string, value: any) {
    this.#cache.set(name, value);
    return void 0;
  }
  const() {}
  /**
   * Returns value by key from #cache
   * @param name
   * @returns
   */
  get(name: string) {
    return this.#_recursiveGet(name);
  }
  #_get(name: string) {
    return this.#cache.has(name) ? this.#cache.get(name) ?? null : void 0;
  }
  /**
   * Remove value by key from #cache
   * @param name
   * @returns
   */
  remove(name: string) {
    return this.#cache.delete(name);
  }

  /**
   * Recursively get from Environment to Environment
   * @param name
   * @returns
   */
  #_recursiveGet(name: string) {
    let env = this as Environment;
    while (true) {
      try {
        let res = env.#_get(name);
        if (res === void 0)
          throw new AoijsError(
            "function",
            `Identifier ${name} is not defined`,
            undefined,
            name,
          );
        return res;
      } catch (err) {
        if (env?.parent) {
          env = env.parent;
          continue;
        }
        throw err /*undefined*/;
      }
    }
  }
}

export { Environment };
