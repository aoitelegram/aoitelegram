import { parse } from "../../parser";

export default {
  name: "$if",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$if")) return;

    const [condition, ifTrue, ifFalse] = ctx.getArgs(0, 3);
    const opIdx = condition.child.findIndex((node) => node.type === "operator");
    const opNode = condition.child[opIdx];

    if (!opNode) {
      return Boolean(await ctx.evaluateArgs([condition]))
        ? ctx.evaluateArgs([ifTrue])
        : ctx.evaluateArgs([ifFalse]);
    }

    let [condA, condB] = await ctx.evaluateArgs([
      { type: "argument", child: condition.child.slice(0, opIdx) },
      { type: "argument", child: condition.child.slice(opIdx + 1) },
    ]);
    let res: boolean;
    condA = parse(condA);

    switch (true) {
      case opNode.value == "==":
        res = condA == condB;
        break;
      case opNode.value == "!=":
        res = condA != condB;
        break;
      case opNode.value == ">=":
        res = condA >= condB;
        break;
      case opNode.value == ">":
        res = condA > condB;
        break;
      case opNode.value == "<=":
        res = condA <= condB;
        break;
      case opNode.value == "<":
        res = condA < condB;
        break;
      default:
        res = false;
        break;
    }

    if (res === true) return await ctx.evaluateArgs([ifTrue]);
    if (res === false) return await ctx.evaluateArgs([ifFalse]);

    throw new Error("Invalid operator!");
  },
};
