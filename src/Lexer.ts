const SYNTAX = "[]\\;$";
const OPS = /[!=<>]+$/;
const FN_DEF = /[a-z_]/i;

type TokenString = { type: "string"; value: string };
type TokenNumber = { type: "number"; value: number };
type TokenCall = {
  type: "call";
  value: string;
  child: TokenArgument[];
  pos: number;
  line: number;
};
type TokenOpen = { type: "open" };
type TokenClose = { type: "close" };
type TokenNewArg = { type: "newArg" };
type TokenOperator = {
  type: "operator";
  value: "==" | "!=" | ">=" | "<=" | ">" | "<" | "!";
};
type TokenArgument = { type: "argument"; child: Token[] };
type TokenProgram = { type: "program"; child: Token[] };
type Token = { pos: number; line: number } & (
  | TokenArgument
  | TokenProgram
  | TokenString
  | TokenNumber
  | TokenCall
  | TokenOpen
  | TokenClose
  | TokenNewArg
  | TokenOperator
);

class Lexer {
  pos = 0;
  line = 0;
  col = 0;
  escape_c = false;
  constructor(public input: string) {
    if (typeof input !== "string" || !input)
      throw new Error("input arg must be non-empty and typeof string!");
  }

  main() {
    const Tokens: Token[] = [];
    while (true) {
      let res = this.advance();
      if (res) Tokens.push(res);
      if (this.eof()) break;
    }
    return this.clean(Tokens);
  }

  peek(offset = 0) {
    return this.input[this.pos + offset];
  }

  next() {
    let current = this.input[this.pos++];
    if (this.peek() === "\n") {
      this.line += 1;
      this.col = 0;
    } else {
      this.col += 1;
    }
    return current;
  }

  eof() {
    return this.peek() === "" || this.peek() === undefined;
  }

  isOperator(x: string) {
    return OPS.test(x);
  }

  isSyntax(c: string) {
    return SYNTAX.indexOf(c) > -1;
  }

  isNumber(x: string) {
    return parseInt(x) === Number(x);
  }

  parseOperator(x: string): Token {
    switch (x) {
      case "==":
      case "!=":
      case ">=":
      case "<=":
      case ">":
      case "<":
        return { type: "operator", value: x, pos: this.col, line: this.line };
    }
    return { type: "string", value: x, pos: this.col, line: this.line };
  }

  validateCall(c: string) {
    return FN_DEF.test(c);
  }

  parseCall(): Token {
    const fn = this.readInput(this.validateCall);
    if (!fn)
      return { type: "string", value: "$", pos: this.col, line: this.line };
    return {
      type: "call",
      value: "$" + fn,
      child: [],
      pos: this.col,
      line: this.line,
    };
  }

  validateString(c: string) {
    return !(this.isSyntax(c) || this.isOperator(c));
  }

  parseString(): Token {
    const str = this.readInput(this.validateString);
    if (this.isNumber(str))
      return {
        type: "number",
        value: Number(str),
        pos: this.col,
        line: this.line,
      };
    return { type: "string", value: str, pos: this.col, line: this.line };
  }

  readInput(validator: (c: string) => boolean) {
    let str = "";
    while (!this.eof() && validator.apply(this, [this.peek()])) {
      str += this.next();
    }
    return str;
  }

  advance(): Token | undefined {
    let c = this.peek();
    if (this.escape_c) {
      this.escape_c = false;
      this.next();
      if (this.isSyntax(c) || this.isOperator(c))
        return { type: "string", value: c, pos: this.col, line: this.line };
      return {
        type: "string",
        value: "\\" + c,
        pos: this.col,
        line: this.line,
      };
    }
    switch (c) {
      case "[": {
        this.next();
        return { type: "open", pos: this.col, line: this.line };
      }
      case "]": {
        this.next();
        return { type: "close", pos: this.col, line: this.line };
      }
      case ";": {
        this.next();
        return { type: "newArg", pos: this.col, line: this.line };
      }
      case "\\": {
        this.next();
        this.escape_c = true;
        return void 0;
      }
      case "$": {
        this.next();
        return this.parseCall();
      }
    }

    if (this.isOperator(c)) {
      this.next();
      if (this.isOperator(c + this.peek()))
        return this.parseOperator(c + this.next());
      return this.parseOperator(c);
    }
    return this.parseString();
  }

  clean(tokens: Token[]) {
    let newArr: Token[] = [];
    let token: Token | undefined;
    let current: Token | undefined;
    while (tokens.length > 0) {
      token = tokens.shift();
      if (!current) {
        current = token;
        continue;
      }
      if (current?.type === "string" && current?.type === token?.type) {
        current.value += token.value;
        continue;
      } else {
        if (current?.type !== "string") {
          newArr.push(current);
          current = token;
        } else {
          if (token?.type !== "string") {
            newArr.push(current);
            current = token;
          } else throw new Error("dunno wat to do");
        }
      }
    }

    if (current) newArr.push(current);
    token = void 0;
    current = void 0;

    return newArr;
  }
}

export {
  Lexer,
  Token,
  TokenString,
  TokenNumber,
  TokenArgument,
  TokenProgram,
  TokenCall,
  TokenOpen,
  TokenClose,
  TokenNewArg,
  TokenOperator,
};
