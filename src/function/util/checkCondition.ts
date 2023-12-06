export default {
  name: "$checkCondition",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const [condition] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([condition], error, ["string"]);
    if (
      !["==", "!=", "<=", ">=", "||", "&&", "<", ">"].some((search) =>
        condition.includes(search),
      )
    ) {
      return error.customError("Valid operators", "$checkCondition");
    }
    try {
      const result = eval(condition);
      if (result !== true && result !== false) {
        return error.customError("Invalid condition", "$checkCondition");
      }
      return result;
    } catch (err) {
      return false;
    }
  },
};
