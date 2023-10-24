import { DataFunction } from "context";

const data: DataFunction = {
  name: "$stringConcat",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$stringConcat")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    const text = args.shift();
    return text.concat(...args);
  },
};

export { data };
