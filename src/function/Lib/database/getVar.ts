import { DataFunction } from "context";

const data: DataFunction = {
  name: "$getVar",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(1, true, error, "$getVar")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    args[1] === undefined ? (args[1] = "main") : null;

    if (!(await database.hasTable(args[1]))) {
      error.errorTable(args[1], "$getVar");
      return;
    }

    return await database.get(args[1], args[0]);
  },
};

export { data };
