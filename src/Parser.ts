import { Token, TokenArgument, TokenProgram, TokenString } from "./Lexer";
import { Runtime } from "./Runtime";

class Parser {
  tokens: Token[];
  #busy: boolean;
  constructor() {
    this.tokens = [];
    this.#busy = false;
  }

  get isBusy() {
    return this.#busy;
  }
  parseToAst(tokens: Token[], runtime: Runtime): TokenProgram {
    if (this.#busy) throw new Error("Parser is #busy!");
    this.tokens = tokens;
    this.#busy = true;
    let arr = [];
    while (!this.eof()) {
      arr.push(this.parseAtom(runtime));
    }
    return { type: "program", child: arr as Token[] };
  }
  peek(offset = 0) {
    return this.tokens[offset];
  }
  shift() {
    return this.tokens.shift();
  }
  eof() {
    return !(this.tokens.length > 0);
  }
  last(arr: any[]) {
    return arr[arr.length - 1];
  }
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
      arg = void 0;
    }
    if (end === false) throw new Error(`Expected ']', got none`);
    return arr;
  }
  parseParen(runtime: Runtime): TokenArgument[] {
    return this.readArgument(runtime);
  }
  parseAtom(runtime: Runtime): Token | undefined {
    let token = this.shift();
    if (token?.type === "string") return token;
    if (token?.type === "number") return token;
    if (token?.type === "operator") return token;
    if (token?.type === "call") {
      if (this.peek()?.type === "open") token.child = this.parseParen(runtime);
      return token;
    }
    if (runtime.options.alwaysStrict === false)
      switch (token?.type) {
        case "open":
          return { value: "[", type: "string" } as Token;
        case "close":
          return { value: "]", type: "string" } as Token;
        case "newArg":
          return { value: ";", type: "string" } as Token;
      }

    throw new Error(
      `Unexpected token of ${token?.type} at ${token?.pos}:${token?.line}`,
    );
  }
}

export { Parser };
