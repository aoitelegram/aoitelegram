import { Context } from "./Context";
import { AoijsError } from "./classes/AoiError";

type EnvFunction = (ctx: Context) => any;
class Environment {
  private cache = new Map<string, any>();
  private constant = new Map<string, boolean>();
  public constructor(private parent?: Environment) {
    if (parent && !(parent instanceof Environment))
      throw new Error("parent env must be instanceof Environment!");
  }
  public set(name: string, value: EnvFunction): any;
  /**
   * Sets a key-value into cache
   * @param name
   * @param value
   * @returns
   */
  public set(name: string, value: any) {
    this.cache.set(name, value);
    return void 0;
  }
  public const() {}
  /**
   * Returns value by key from cache
   * @param name
   * @returns
   */
  public get(name: string) {
    return this._recursiveGet(name);
  }
  private _get(name: string) {
    return this.cache.has(name) ? this.cache.get(name) ?? null : void 0;
  }
  /**
   * Remove value by key from cache
   * @param name
   * @returns
   */
  public remove(name: string) {
    return this.cache.delete(name);
  }

  /**
   * Recursively get from Environment to Environment
   * @param name
   * @returns
   */
  private _recursiveGet(name: string) {
    let env = this as Environment;
    while (true) {
      try {
        let res = env._get(name);
        if (res === void 0)
          throw new AoijsError(
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
