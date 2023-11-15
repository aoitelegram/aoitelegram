import { DataFunction } from "context";

const data: DataFunction = {
  name: "$setVar",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$setVar")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());

    if (!(await database.has("main", args[0]))) {
      error.errorVar(args[0], "$setVar");
      return;
    }

    args[2] === undefined ? (args[2] = "main") : null;

    if (!(await database.hasTable(args[2]))) {
      error.errorTable(args[2], "$setVar");
      return;
    }

    await database.set(args[2], args[0], args[1]);
    return undefined;
  },
};

export { data };
