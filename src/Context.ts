import { Environment } from "./Environment";
import { RuntimeBag } from "./RuntimeBag";
import { TokenArgument, TokenCall } from "./Lexer";
import { Runtime, RuntimeOptions } from "./Runtime";
import { Evaluator } from "./Evaluator";
import { AoijsError } from "./classes/AoiError";
type FnFunction = (ctx: Context) => string;

class Context {
  #_target: TokenCall | null = null;
  options: RuntimeOptions;

  /**
   * Creates a new instance of the Context class.
   * @param fileName - The name of the file.
   * @param bag - RuntimeBag object.
   * @param env - Environment object.
   * @param runtime - Runtime object.
   */
  constructor(
    public fileName: string,
    public bag: RuntimeBag,
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
    const fn = this.env.get(node.value);
    const lastTarget = this.#_target;
    this.#_target = node;

    if (typeof fn === "function") {
      const result = (fn as FnFunction)(this);
      this.#_target = lastTarget;
      return result;
    }

    this.#_target = lastTarget;
    return fn;
  }

  /**
   * Check if the number of arguments is as expected.
   * @param amount - Amount of arguments required.
   * @param throwError - Throw error automatically.
   * @param event - Event object.
   * @param messageError - error message
   */
  argsCheck(amount = 1, throwError = true, event: any) {
    const target = this.#_target;

    if (!target || target.child.length < amount) {
      if (throwError) {
        this.errorMessage(target, amount, event);
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
    const target = this.#_target;

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
      args.map((v) => Evaluator.singleton.visitArgument(v, this)),
    );
  }

  errorMessage(
    target: TokenCall | null,
    amount: number,
    event: any,
    messageError: string = "default",
  ) {
    const textError =
      messageError === "default"
        ? `Expected ${amount} arguments but got ${target?.child.length}`
        : messageError;
    const errorText = this.createAoiError(
      target?.value as string,
      textError,
      target?.line,
    );
    event.telegram.sendMessage(
      event.chat?.id ?? event.message?.chat.id,
      errorText,
      { parse_mode: "HTML" },
    );
  }

  /**
   * Create an AoiError message.
   * @param command - The name of the command.
   * @param details - Details of the error.
   * @param line - Line number of the error.
   */
  createAoiError(command: string, details: string, line?: number) {
    return `<code>AoiError: ${command}: ${details}\n{ 
  line : ${line},
  command : ${command} 
}</code>`;
  }
}

export { Context };
