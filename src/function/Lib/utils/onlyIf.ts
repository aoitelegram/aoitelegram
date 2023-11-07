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
  name: "$onlyIf",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$onlyIf")) return;

    const [condition, ifTrue, replyMessage] = ctx.getArgs(0, 2);
    const opIdx = condition.child.findIndex(
      (node: any) => node.type === "operator",
    );
    const opNode = condition.child[opIdx] as any;

    let [condA, condB] = await ctx.evaluateArgs([
      { type: "argument", child: condition.child.slice(0, opIdx) },
      { type: "argument", child: condition.child.slice(opIdx + 1) },
    ]);
    condA = convertStringToType(condA);
    condB = convertStringToType(condB);
    let res: boolean;

    switch (true) {
      case opNode?.value == "==":
        res = condA == condB;
        break;
      case opNode?.value == "!=":
        res = condA != condB;
        break;
      case opNode?.value == ">=":
        res = condA >= condB;
        break;
      case opNode?.value == ">":
        res = condA > condB;
        break;
      case opNode?.value == "<=":
        res = condA <= condB;
        break;
      case opNode?.value == "<":
        res = condA < condB;
        break;
      default:
        res = false;
        break;
    }

    if (!res) {
      const response = (await ctx.evaluateArgs([ifTrue]))[0];
      if (!!response) {
        if (replyMessage) event.reply(response);
        else event.send(response);
      }
      return { stop: true };
    }
  },
};

export { data };