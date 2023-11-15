import { DataFunction } from "context";

const data: DataFunction = {
  name: "$commandInfo",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(1, true, error, "$commandInfo")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    const commands = event.telegram?.commands.get({ name: args[0] });
    return commands?.[args[1] ?? "code"];
  },
};

export { data };
