import { DataFunction } from "context";

function convertStringToType(input: string): any {
  if (input === "true") {
    return true;
  }
  if (input === "false") {
    return false;
  } else if (input === "null") {
    return null;
  } else if (input === "undefined") {
    return undefined;
  } else if (!isNaN(parseFloat(input))) {
    return parseFloat(input);
  } else if (input?.startsWith?.("{") && input?.endsWith?.("}")) {
    return JSON.parse(JSON.stringify(input));
  } else {
    return input;
  }
}

const data: DataFunction = {
  name: "$if",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$if")) return;

    const [condition, ifTrue, ifFalse] = ctx.getArgs(0, 3);
    const opIdx = condition.child.findIndex(
      (node: any) => node.type === "operator",
    );
    const opNode = condition.child[opIdx] as any;

    if (!opNode) {
      return Boolean(await ctx.evaluateArgs([convertStringToType(condition)]))
        ? ctx.evaluateArgs([ifTrue])
        : ctx.evaluateArgs([ifFalse]);
    }

    let [condA, condB] = await ctx.evaluateArgs([
      { type: "argument", child: condition.child.slice(0, opIdx) },
      { type: "argument", child: condition.child.slice(opIdx + 1) },
    ]);
    condA = convertStringToType(condA);
    condB = convertStringToType(condB);
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

    if (res === true) return await ctx.evaluateArgs([ifTrue]);
    if (res === false) return await ctx.evaluateArgs([ifFalse]);

    throw new Error("Invalid operator!");
  },
};

export { data };
