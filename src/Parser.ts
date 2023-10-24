import { Token, TokenArgument, TokenProgram, TokenString } from "./Lexer";
import { AoijsError } from "./classes/AoiError";
import { Runtime } from "./Runtime";

/**
 * The Parser class is responsible for parsing tokens into an Abstract Syntax Tree (AST).
 */
class Parser {
  tokens: Token[];
  #busy: boolean;

  /**
   * Creates a new instance of the Parser.
   */
  constructor() {
    this.tokens = [];
    this.#busy = false;
  }

  /**
   * Checks if the parser is currently busy.
   */
  get isBusy() {
    return this.#busy;
  }

  /**
   * Parses an array of tokens into an AST.
   * @param tokens - Array of tokens to parse.
   * @param runtime - The runtime context.
   * @returns The parsed AST.
   */
  parseToAst(tokens: Token[], runtime: Runtime): TokenProgram {
    if (this.#busy) throw new Error("Parser is #busy!");
    this.tokens = tokens;
    this.#busy = true;
    let arr: Token[] = [];

    while (!this.eof()) {
      arr.push(this.parseAtom(runtime) as Token);
    }

    return { type: "program", child: arr };
  }

  /**
   * Peeks at a token at a specific offset without consuming it.
   * @param offset - The offset to peek (default is 0).
   * @returns The token at the specified offset.
   */
  peek(offset = 0) {
    return this.tokens[offset];
  }

  /**
   * Shifts and returns the first token from the tokens array.
   * @returns The shifted token.
   */
  shift() {
    return this.tokens.shift();
  }

  /**
   * Checks if there are no more tokens to parse.
   * @returns True if there are no more tokens, otherwise false.
   */
  eof() {
    return this.tokens.length === 0;
  }

  /**
   * Returns the last element of an array.
   * @param arr - The array to retrieve the last element from.
   * @returns The last element of the array.
   */
  last<T>(arr: T[]) {
    return arr[arr.length - 1];
  }

  /**
   * Reads and parses the argument tokens within square brackets.
   * @param runtime - The runtime context.
   * @returns An array of argument tokens.
   */
  readArgument(runtime: Runtime) {
    let arr: TokenArgument[] = [];
    let end = false;
    let arg: TokenArgument | undefined = { type: "argument", child: [] };
    this.shift();

    while (!this.eof()) {
      if (this.peek()?.type === "close") {
        end = true;
        this.shift();
        break;
      }

      if (this.peek()?.type === "newArg") {
        arr.push(arg);
        arg = { type: "argument", child: [] };
        this.shift();
        continue;
      }

      if (arg.child === undefined) arg.child = [];
      arg.child.push(this.parseAtom(runtime) as Token);
    }

    if (arg) {
      arr.push(arg);
      arg = undefined;
    }

    if (end === false) throw new AoijsError("symbol", "Expected ']', got none");

    return arr;
  }

  /**
   * Parses tokens within parentheses.
   * @param runtime - The runtime context.
   * @returns An array of argument tokens.
   */
  parseParen(runtime: Runtime): TokenArgument[] {
    return this.readArgument(runtime);
  }

  /**
   * Parses a single token in the input.
   * @param runtime - The runtime context.
   * @returns The parsed token or undefined.
   */
  parseAtom(runtime: Runtime): Token | undefined {
    let token = this.shift();

    if (token?.type === "string") return token;
    if (token?.type === "number") return token;
    if (token?.type === "operator") return token;
    if (token?.type === "call") {
      if (this.peek()?.type === "open") token.child = this.parseParen(runtime);
      return token;
    }

    if (runtime.options.alwaysStrict === false) {
      switch (token?.type) {
        case "open":
          return { value: "[", type: "string" } as Token;
        case "close":
          return { value: "]", type: "string" } as Token;
        case "newArg":
          return { value: ";", type: "string" } as Token;
      }
    }

    throw new AoijsError(
      "parser",
      `Unexpected token of type ${token?.type} at ${token?.pos}:${token?.line}`,
    );
  }
}

export { Parser };
