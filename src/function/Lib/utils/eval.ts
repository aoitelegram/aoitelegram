import { DataFunction } from "context";

const data: DataFunction = {
  name: "$eval",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(1, true, error, "$eval")) return;
    const content = await ctx.evaluateArgs(ctx.getArgs());
    return event.telegram
      .runCode(ctx.fileName, ...content, event)
      .then((res: unknown) => res)
      .catch((err: unknown) => console.log(err));
  },
};

export { data };
