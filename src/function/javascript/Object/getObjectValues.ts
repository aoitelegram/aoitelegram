export default {
  name: "$getObjectValues",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$getObjectValues");
    const [object, sep = ", "] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([object, sep], error, ["object", "unknown"]);

    let values: unknown[] = [];

    const stack = [object];

    while (stack.length > 0) {
      const current = stack.pop();
      for (const key in current) {
        const value = current?.[key];
        if (Array.isArray(value)) {
          values.push(...value);
        } else if (typeof value === "object") {
          stack.push(value);
        } else {
          values.push(value);
        }
      }
    }

    return values.length > 0 ? values.join(sep) : undefined;
  },
};
