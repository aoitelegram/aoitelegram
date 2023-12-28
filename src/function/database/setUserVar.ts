import { hasChatPrivate } from "../helpers";

export default {
  name: "$setUserVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$setUserVar");
    const args = await ctx.getEvaluateArgs();
    const userId = args[2] || event.from?.id || event.message?.from.id;
    const chatId = event.chat?.id || event.message?.chat.id;
    const defaultTable = args[3] || database.tables[0];
    ctx.checkArgumentTypes(args, error, [
      "string",
      "unknown",
      "string | number | undefined",
      "string | undefined",
    ]);

    if (!database.has(defaultTable, args[0])) {
      error.errorVar(args[0], "$setVar");
      return;
    }

    if (!(await hasChatPrivate(event, userId))) {
      error.customError("Invalid User Id", "$setUserVar");
      return;
    }

    await database.set(
      defaultTable,
      `user_${userId}_${chatId}_${args[0]}`,
      args[1],
    );
  },
};
