import { Token } from "./Lexer";

class RuntimeBag {
  public traces = new Map<Token, Token[]>();
  public constructor() {}

  addTrace(parent: Token, child: Token) {}
}

export { RuntimeBag };
