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
    if (this.#busy) throw new AoijsError("parser", "Parser is busy!");
    this.tokens = tokens;
    this.#busy = true;
    let array: Token[] = [];

    while (!this.isEndOfInput()) {
      array.push(this.parseAtom(runtime) as Token);
    }

    return { type: "program", child: array };
  }

  /**
   * Peeks at a token at a specific offset without consuming it.
   * @param offset - The offset to peek (default is 0).
   * @returns The token at the specified offset.
   */
  getCharacterAtOffset(offset = 0) {
    return this.tokens[offset];
  }

  /**
   * Shifts and returns the first token from the tokens array.
   * @returns The shifted token.
   */
  popFirstToken() {
    return this.tokens.shift() as Token;
  }

  /**
   * Checks if there are no more tokens to parse.
   * @returns True if there are no more tokens, otherwise false.
   */
  isEndOfInput() {
    return this.tokens.length === 0;
  }

  /**
   * Returns the last element of an array.
   * @param array - The array to retrieve the last element from.
   * @returns The last element of the array.
   */
  last<T>(array: T[]) {
    return array[array.length - 1];
  }

  /**
   * Reads and parses the argument tokens within square brackets.
   * @param runtime - The runtime context.
   * @returns An array of argument tokens.
   */
  readArguments(runtime: Runtime) {
    const argument: TokenArgument[] = [];
    let reachedEnd = false;
    let currentArgument: TokenArgument | undefined = {
      type: "argument",
      child: [],
    };

    this.popFirstToken();

    while (!this.isEndOfInput()) {
      if (this.getCharacterAtOffset()?.type === "close") {
        reachedEnd = true;
        this.popFirstToken();
        break;
      }

      if (this.getCharacterAtOffset()?.type === "newArg") {
        argument.push(currentArgument);
        currentArgument = { type: "argument", child: [] };
        this.popFirstToken();
        continue;
      }

      if (!currentArgument.child) {
        currentArgument.child = [];
      }

      currentArgument.child.push(this.parseAtom(runtime) as Token);
    }

    if (currentArgument) {
      argument.push(currentArgument);
      currentArgument = undefined;
    }

    if (!reachedEnd) {
      throw new AoijsError("symbol", "Expected ']', got none");
    }

    return argument;
  }

  /**
   * Parses tokens within parentheses.
   * @param runtime - The runtime context.
   * @returns An array of argument tokens.
   */
  parseParen(runtime: Runtime): TokenArgument[] {
    return this.readArguments(runtime);
  }

  /**
   * Parses a single token in the input.
   * @param runtime - The runtime context.
   * @returns The parsed token.
   */
  parseAtom(runtime: Runtime) {
    let token = this.popFirstToken();
    switch (token.type) {
      case "string":
      case "integer":
      case "float":
      case "nan":
      case "boolean":
      case "object":
      case "null":
      case "undefined":
      case "operator":
        return token;
      case "open":
        return "[";
      case "close":
        return "]";
      case "call":
        if (this.getCharacterAtOffset()?.type === "open") {
          token.child = this.parseParen(runtime);
        }
        return token;
      default:
        return token;
    }

    if (runtime.options.alwaysStrict === false) {
      switch (token.type) {
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
      `Unexpected token of type ${token.type} at ${token.pos}:${token.line}`,
    );
  }
}

export { Parser };
