import { Context } from "context";

export const data = {
  name: "$if",
  callback: async (ctx: Context) => {
    ctx.argsCheck(2); // Requires 2 arguments
    const [condition, ifTrue, ifFalse] = ctx.getArgs(0, 3);
    const op_idx = condition.child.findIndex((v: any) => v.type === "operator");
    const op = condition.child[op_idx] as any;
    //   if (!op) return Boolean(await ctx.evaluateArgs([condition])) ? ctx.evaluateArgs([ifTrue]) : ctx.evaluateArgs([ifFalse]);
    const [cond_a, cond_b] = await ctx.evaluateArgs([
      { type: "argument", child: condition.child.slice(0, op_idx) },
      { type: "argument", child: condition.child.slice(op_idx + 1) },
    ]);
    let res: boolean;
    switch (op.value) {
      case "==":
        res = cond_a == cond_b;
        break;
      case "!=":
        res = cond_a != cond_b;
        break;
      case ">=":
        res = cond_a >= cond_b;
        break;
      case ">":
        res = cond_a > cond_b;
        break;
      case "<=":
        res = cond_a <= cond_b;
        break;
      case "<":
        res = cond_a < cond_b;
        break;
      default:
        res = false;
        break;
    }
    if (res === true) return ctx.evaluateArgs([ifTrue]);
    if (res === false) return ctx.evaluateArgs([ifFalse]);
    throw new Error("Invalid operator!");
  },
};
