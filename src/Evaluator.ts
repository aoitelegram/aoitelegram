import { Context } from "./Context";
import { Token, TokenArgument, TokenCall, TokenProgram } from "./Lexer";

class Evaluator {
  static singleton = new Evaluator();
  public constructor() {}
  async evaluate(ast: TokenProgram, ctx: Context) {
    const res = await this.visitArgument(ast, ctx);
    if (ctx.options.trimOutput && typeof res === "string") return res.trim();
    return res;
  }
  visit(node: Token, ctx: Context): any {
    if (node.type === "string") return node.value;
    if (node.type === "number") return node.value;
    if (node.type === "operator") return node.value;
    if (node.type === "call") return this.visitCall(node, ctx);
    if (node.type === "argument") return this.visitArgument(node, ctx);
    throw new Error("Unknown type of " + node.type + "!");
  }
  visitCall(node: TokenCall, ctx: Context) {
    return ctx.callIdentifier(node);
  }
  async visitArgument(
    arg: TokenProgram | TokenArgument,
    ctx: Context,
    map = true,
  ): Promise<any> {
    let arr = arg.child?.copyWithin(-1, -1) ?? [];
    let v = [];
    while (arr?.length > 0) {
      let node = arr.shift() as Token;
      let res = await this.visit(node, ctx);
      v.push(res);
    }
    return map ? this.mapValues(v) : v;
  }

  async mapValues(values: any[]) {
    if (values.length <= 1) return values[0];
    return (await Promise.all(values.map(async (v) => String(await v)))).join(
      "",
    );
  }
}
export { Evaluator };
