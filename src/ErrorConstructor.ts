import { Context } from "./Context";
import { Token, TokenProgram } from "./Lexer";

class RuntimeError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "Error";
  }

  buildStackTrace(target: Token, ast: TokenProgram, context: Context) {}

  _traceTarget(ast: TokenProgram, target: Token) {
    let i = 0;
  }
}
