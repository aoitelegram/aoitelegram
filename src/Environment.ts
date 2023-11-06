import { Context } from "./Context";
import { AoijsError } from "./classes/AoiError";

type EnvFunction = (ctx: Context) => unknown;

/**
 * The Environment class represents a context in which functions and variables can be stored and retrieved.
 */
class Environment {
  #cache = new Map<string, EnvFunction>();
  #constant = new Map<string, boolean>();
  constructor(private parent?: Environment) {
    if (parent && !(parent instanceof Environment)) {
      throw new AoijsError(
        "instanceof",
        "parent env must be instanceof Environment!",
      );
    }
  }

  /**
   * Sets a key-value pair into the #cache.
   * @param name - The name of the key.
   * @param value - The value to associate with the key.
   * @returns undefined.
   */
  set(name: string, value: EnvFunction) {
    this.#cache.set(name, value);
    return undefined;
  }

  /**
   * Returns the value associated with a key from the #cache.
   * @param name - The name of the key.
   * @returns The value associated with the key, recursively looking in parent environments if necessary.
   */
  get(name: string) {
    return this.#recursiveGet(name);
  }

  #get(name: string) {
    return this.#cache.has(name) ? this.#cache.get(name) ?? null : undefined;
  }

  /**
   * Removes a key-value pair from the #cache.
   * @param name - The name of the key to remove.
   * @returns true if the key-value pair was removed, false if the key was not found.
   */
  remove(name: string) {
    return this.#cache.delete(name);
  }

  /**
   * Recursively gets a value from the current environment and its parent environments.
   * @param name - The name of the key to retrieve.
   * @returns The value associated with the key, or throws an error if not found.
   */
  #recursiveGet(name: string) {
    let currentEnv: Environment | undefined = this;

    while (currentEnv) {
      try {
        const value = currentEnv.#get(name);
        if (value === undefined) {
          throw new AoijsError(
            "function",
            `Identifier ${name} is not defined`,
            undefined,
            name,
          );
        }
        return value;
      } catch (err) {
        currentEnv = currentEnv.parent;
        if (!currentEnv) {
          throw err;
        }
      }
    }
  }
}

export { Environment };
