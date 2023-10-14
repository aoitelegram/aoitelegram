import { Token } from "./Lexer";

class RuntimeBag {
  traces = new Map<Token, Token[]>();
  constructor() {}

  addTrace(parent: Token, child: Token) {}
}

export { RuntimeBag };
