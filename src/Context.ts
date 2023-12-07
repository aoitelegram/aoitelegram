import { Collection } from "telegramsjs";
import { Evaluator } from "./Evaluator";
import { Environment } from "./Environment";
import { toParse } from "./function/parser";
import { Runtime, RuntimeOptions } from "./Runtime";
import { AoijsError, MessageError } from "./classes/AoiError";
import { TokenArgument, TokenCall, TokenValue } from "./Lexer";
type FnFunction = (ctx: Context) => unknown;
let target: TokenCall = {} as TokenCall;

class Context {
  options: RuntimeOptions;
  callback_query: unknown[] = [];
  replyMessage: boolean = false;
  private target: TokenCall = {} as TokenCall;
  private localVars: Collection<string, unknown> = new Collection();
  private array: Collection<string, unknown> = new Collection();
  private object: Collection<string, unknown> = new Collection();
  private random: Collection<string, unknown> = new Collection();
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
    const lastTarget = this.target;
    this.target = node;
    target = node;
    if (typeof fun === "function") {
      const result = (fun as FnFunction)(this);
      this.target = lastTarget;
      return result;
    }

    this.target = lastTarget;
    return fun;
  }

  /**
   * Check if the number of arguments is as expected.
   * @param amount - Amount of arguments required.
   * @param error - Error class.
   * @param func - Error function
   */
  argsCheck(amount = 1, error: MessageError, func?: string) {
    const target = this.target;
    if (!target || target.child.length < amount) {
      error.errorArgs(
        amount,
        target.child.length ?? 0,
        func ?? target.value,
        target.line,
      );
    }
  }

  /**
   * Get arguments from 'start' up to 'end'.
   * @param start - The start index.
   * @param end - Amount of arguments to be returned.
   */
  getArgs(start = -1, end = 1) {
    const target = this.target;
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
  async evaluateArgs(args: TokenArgument[]): Promise<TokenValue[]> {
    return Promise.all(
      args.map((value) => Evaluator.singleton.visitArgument(value, this)),
    );
  }

  /**
   * Retrieve and evaluate arguments from the 'start' index up to a specified 'end' count.
   * @param start - The starting index for retrieving arguments.
   * @param end - The number of arguments to be retrieved and evaluated.
   */
  async getEvaluateArgs(start = -1, end = 1): Promise<TokenValue[]> {
    const asyncArgs = await this.getArgs(start, end);
    const asyncEvaluate = await this.evaluateArgs(asyncArgs);
    return asyncEvaluate;
  }

  /**
   * Checks whether the provided arguments match the expected argument types for a function.
   * @param argument Array of arguments to be checked.
   * @param errorMessage Object to handle error messages.
   * @param expectedArgumentTypes Array of expected argument types.
   */
  checkArgumentTypes<T extends string>(
    argument: T[],
    errorMessage: MessageError,
    expectedArgumentTypes: string[],
  ) {
    for (
      let argumentIndex = 0;
      argumentIndex < argument.length;
      argumentIndex++
    ) {
      const actualArgumentType =
        typeof argument[argumentIndex] === "object"
          ? "object"
          : toParse(`${argument[argumentIndex]}`);
      if (!expectedArgumentTypes[argumentIndex]) {
        expectedArgumentTypes[argumentIndex] = "unknown";
      }
      const expectedArgumentTypeSet = new Set(
        expectedArgumentTypes[argumentIndex]
          .split("|")
          .map((arg) => arg.trim()),
      );

      if (expectedArgumentTypeSet.has("unknown")) continue;

      const isVariadic = new Set(
        expectedArgumentTypes[argumentIndex]
          .split("|")
          .map((arg) => arg.trim().includes("...")),
      ).has(true);
      if (isVariadic) {
        const variadicTypes = new Set(
          expectedArgumentTypes[argumentIndex]
            .split("|")
            .map((arg) => arg.trim())
            .join(" ")
            .split("...")
            .map((arg) => (arg ? arg.trim() : undefined)),
        );
        const variadicTypesName = expectedArgumentTypes[argumentIndex];
        const sliceTypes = argument.slice(argumentIndex);
        for (
          let argumentIndex = 0;
          argumentIndex < sliceTypes.length;
          argumentIndex++
        ) {
          const nextExpectedType = toParse(`${sliceTypes[argumentIndex]}`);
          const actualArgumentType = toParse(`${sliceTypes[argumentIndex]}`);
          if (variadicTypesName.includes("...unknown")) break;
          if (!variadicTypes.has(nextExpectedType)) {
            errorMessage.customError(
              `The ${argumentIndex + 1}-th argument of the function ${
                target.value
              } is expected to have the type ${variadicTypesName} after the variadic parameter, but the actual value passed to the argument has the type ${actualArgumentType}`,
              target.value,
              target.line,
            );
          }
        }
        break;
      } else if (!expectedArgumentTypeSet.has(actualArgumentType)) {
        errorMessage.customError(
          `The ${argumentIndex + 1}-th argument of the function ${
            target.value
          } is expected to have one of the types ${
            expectedArgumentTypes[argumentIndex]
          }, but the actual value passed to the argument has the type ${actualArgumentType}`,
          target.value,
          target.line,
        );
      }
    }
  }
}

export { Context };
