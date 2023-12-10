export default {
  name: "$random",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$random");
    const [min, max, useCache = true] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([min, max, useCache], error, [
      "number",
      "number",
      "boolean",
    ]);

    const cacheKey = `${min}_${max}`;

    if (useCache && ctx.random.has(cacheKey)) {
      return ctx.random.get(cacheKey);
    }

    const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;

    if (useCache) {
      ctx.random.set(cacheKey, randomValue);
    }

    return randomValue;
  },
};
