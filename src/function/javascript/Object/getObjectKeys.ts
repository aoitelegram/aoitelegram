export default {
  name: "$getObjectKeys",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$getObjectKeys");
    const [object, sep = ", "] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([object, sep], error, ["object", "unknown"]);

    const keys: unknown[] = [];

    const stack = [object];

    while (stack.length > 0) {
      const current = stack.pop();
      for (const key in current) {
        keys.push(key);
        if (typeof current[key] === "object") {
          stack.push(current[key]);
        }
      }
    }

    return keys.length > 0 ? keys.join(sep) : undefined;
  },
};
