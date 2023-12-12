import { ConditionChecker } from "../condition";

export default {
  name: "$if",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$if");

    let [condition, ifTrue, ifFalse] = ctx.getArgs(0, 3);
    condition = await ctx.evaluateArgs([condition]);
    if (
      !["==", "!=", "<=", ">=", "||", "&&", "<", ">"].some(
        (search) => condition[0]?.includes(search),
      )
    ) {
      error.customError("Invalid operators", "$if");
    }

    try {
      const result = eval(ConditionChecker.solve(condition[0]));
      if (result !== true && result !== false) {
        error.customError("Invalid condition", "$if");
      }

      if (result === true) return await ctx.evaluateArgs([ifTrue]);
      if (result === false) return await ctx.evaluateArgs([ifFalse]);
    } catch (err) {
      error.customError("Invalid condition", "$if");
    }
  },
};
