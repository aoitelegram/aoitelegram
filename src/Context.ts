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
  private localVars: Collection<string, unknown> = new Collection();
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
    public type: string,
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
   * @param error - Error class.
   * @param func - error message function.
   */
  argsCheck(amount = 1, error: MessageError, func: string) {
    const target = this.#target;
    if (!target || target.child.length < amount) {
      error.errorArgs(amount, target?.child.length ?? 0, func);
    }
  }

  /**
   * Get arguments from 'start' up to 'end'.
   * @param start - The start index.
   * @param end - Amount of arguments to be returned.
   */
  getArgs(start = -1, end = 1) {
    const target = this.#target;
    if (!target) return [];
    if (start < 0) {
      return target.child.copyWithin(start, start);
    }
    return target.child.slice(start, end + 1);
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

  /**
   * Retrieve and evaluate arguments from the 'start' index up to a specified 'end' count.
   * @param start - The starting index for retrieving arguments.
   * @param end - The number of arguments to be retrieved and evaluated.
   */
  async getEvaluateArgs(start = -1, end = 1) {
    const asyncArgs = await this.getArgs(start, end);
    const asyncEvaluate = await this.evaluateArgs(asyncArgs);
    return asyncEvaluate;
  }
}

export { Context };
