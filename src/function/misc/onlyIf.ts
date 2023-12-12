import { ConditionChecker } from "../condition";

export default {
  name: "$onlyIf",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$onlyIf");

    let [condition, ifTrue, ifFalse] = ctx.getArgs(0, 3);
    condition = await ctx.evaluateArgs([condition]);
    if (
      !["==", "!=", "<=", ">=", "||", "&&", "<", ">"].some(
        (search) => condition[0]?.includes(search),
      )
    ) {
      error.customError("Invalid operators", "$onlyIf");
    }

    try {
      const result = eval(ConditionChecker.solve(condition[0]));
      if (result !== true && result !== false) {
        error.customError("Invalid condition", "$onlyIf");
      }

      if (!result) {
        const response = (await ctx.evaluateArgs([ifTrue]))[0];
        if (!!response) {
          if (ctx.replyMessage) event.reply(response);
          else event.send(response);
        }
        return true;
      }
    } catch (err) {
      error.customError("Invalid condition", "$onlyIf");
    }
  },
};
