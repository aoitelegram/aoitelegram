import { parse } from "../parser";

export default {
  name: "$onlyIf",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error);

    const [condition, ifTrue] = ctx.getArgs(0, 2);
    const opIdx = condition.child.findIndex((node) => node.type === "operator");
    const opNode = condition.child[opIdx];

    let [condA, condB] = await ctx.evaluateArgs([
      { type: "argument", child: condition.child.slice(0, opIdx) },
      { type: "argument", child: condition.child.slice(opIdx + 1) },
    ]);
    condA = parse(condA);
    condB = parse(condB);
    let res: boolean;

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

    if (!res) {
      const response = (await ctx.evaluateArgs([ifTrue]))[0];
      if (!!response) {
        if (ctx.replyMessage) event.reply(response);
        else event.send(response);
      }
      return true;
    }
  },
};
