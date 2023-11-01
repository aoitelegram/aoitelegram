import { Environment } from "./Environment";
import { TokenArgument, TokenCall } from "./Lexer";
import { Runtime, RuntimeOptions } from "./Runtime";
import { Evaluator } from "./Evaluator";
import { AoijsError, MessageError } from "./classes/AoiError";
import { Collection } from "telegramsjs";
type FnFunction = (ctx: Context) => unknown;

class Context {
  #target: TokenCall | null = null;
  options: RuntimeOptions;
  private vars: Collection<string, unknown> = new Collection();
  private array: Collection<string, unknown> = new Collection();
  private object: Collection<string, unknown> = new Collection();
  /**
   * Creates a new instance of the Context class.
   * @param fileName - The name of the file.
   * @param env - Environment object.
   * @param runtime - Runtime object.
   * @param options - options
   */
  constructor(
    public fileName: string | { event: string },
    public env: Environment,
    public runtime: Runtime,
  ) {
    this.options = runtime.options;
  }

  /**
   * Call an identifier function.
   * @param node - TokenCall object.
   */
  async callIdentifier(node: TokenCall) {
    const fun = this.env.get(node.value);
    const lastTarget = this.#target;
    this.#target = node;

    if (typeof fun === "function") {
      const result = (fun as FnFunction)(this);
      this.#target = lastTarget;
      return result;
    }

    this.#target = lastTarget;
    return fun;
  }

  /**
   * Check if the number of arguments is as expected.
   * @param amount - Amount of arguments required.
   * @param throwError - Throw error automatically.
   * @param event - Event object.
   * @param messageError - error message
   */
  argsCheck(amount = 1, throwError = true, error: MessageError, func: string) {
    const target = this.#target;

    if (!target || target.child.length < amount) {
      if (throwError) {
        error.errorArgs(amount, target?.child.length ?? 0, func);
        return false;
      } else {
        return false;
      }
    }
    return true;
  }

  /**
   * Get arguments from 'start' up to 'end'.
   * @param start - The start index.
   * @param end - Amount of arguments to be returned.
   */
  getArgs(start = -1, end = 1) {
    const target = this.#target;

    if (start < 0) {
      return target?.child.copyWithin(start, start);
    }
    return target?.child.slice(start, end + 1);
  }

  /**
   * Evaluate and run provided arguments.
   * @param args - Arguments to run.
   */
  async evaluateArgs(args: TokenArgument[]) {
    return Promise.all(
      args.map((value) => Evaluator.singleton.visitArgument(value, this)),
    );
  }
}

export { Context };
