import { Context } from "./Context";
import { AoijsError } from "./classes/AoiError";
import { Token, TokenArgument, TokenCall, TokenProgram } from "./Lexer";

/**
 * The Evaluator class is responsible for evaluating the Abstract Syntax Tree (AST).
 */
class Evaluator {
  static singleton = new Evaluator();

  /**
   * Creates a new instance of the Evaluator.
   */
  constructor() {}

  /**
   * Evaluates an AST and returns the result.
   * @param ast - The Abstract Syntax Tree to evaluate.
   * @param ctx - The context in which to evaluate the AST.
   * @returns The result of the evaluation.
   */
  async evaluate(ast: TokenProgram, ctx: Context) {
    const response = await this.visitArgument(ast, ctx);
    if (ctx.options.trimOutput && typeof response === "string") {
      return response.trim();
    }

    return response;
  }

  /**
   * Visits a node in the AST and returns the result.
   * @param node - The node to visit.
   * @param ctx - The context in which to visit the node.
   * @returns The result of visiting the node.
   */
  visit(node: Token, ctx: Context) {
    switch (node.type) {
      case "string":
      case "integer":
      case "float":
      case "nan":
      case "boolean":
      case "object":
      case "null":
      case "undefined":
      case "operator":
        return node.value;
      case "call":
        return this.visitCall(node, ctx);
      case "argument":
        return this.visitArgument(node, ctx);
      default:
        throw new AoijsError("visits", `unknown type of ${node.type}!`);
    }
  }

  /**
   * Visits a call node in the AST and returns the result.
   * @param node - The call node to visit.
   * @param ctx - The context in which to visit the call node.
   * @returns The result of visiting the call node.
   */
  visitCall(node: TokenCall, ctx: Context) {
    return ctx.callIdentifier(node);
  }

  /**
   * Visits an argument node in the AST and returns the result.
   * @param argument - The argument node to visit.
   * @param context - The context in which to visit the argument node.
   * @param mapValues - Whether to map the values or return an array.
   * @returns The result of visiting the argument node.
   */
  async visitArgument(
    argument: TokenArgument | TokenProgram,
    context: Context,
    mapValues = true,
  ) {
    let array = argument?.child?.copyWithin(-1, -1) ?? [];
    let valueType: Token[] = [];

    while (array.length > 0) {
      let node = array.shift() as Token;
      let response = await this.visit(node, context);
      valueType.push(response as Token);
    }

    return mapValues ? this.mapValues(valueType) : valueType;
  }

  /**
   * Maps an array of values to a single value.
   * @param values - The array of values to map.
   * @returns The mapped value.
   */
  async mapValues<T>(values: T[]) {
    if (values.length === 0) return "";
    const promises = values.map(async (value) => await value);
    const results = await Promise.all(promises);
    return results.length === 1 ? results[0] : results.join("");
  }
}

export { Evaluator };
