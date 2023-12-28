import { setObjectKey } from "../../parser";

export default {
  name: "$setObjectValue",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$setObjectValue");
    const [object, key, newValue] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([object, newValue, key], error, [
      "object",
      "unknown",
      "unknown",
    ]);

    return setObjectKey(object, key, newValue);
  },
};
