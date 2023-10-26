import { DataFunction } from "context";

const data: DataFunction = {
  name: "$get",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(1, true, error, "$get")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    const reponse = await database.get("vars", args[0]);

    if (args[1]) {
      await database.delete("vars", args[0]);
    }

    return reponse;
  },
};

export { data };
