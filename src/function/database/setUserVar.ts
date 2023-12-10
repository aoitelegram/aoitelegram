export default {
  name: "$setUserVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$setUserVar");
    const args = await ctx.getEvaluateArgs();
    const userId = event.from?.id || event.message?.from.id;
    const chatId = event.chat?.id || event.message?.chat.id;
    const defaultTable = args[3] || database.table[0];
    ctx.checkArgumentTypes(args, error, [
      "string",
      "unknown",
      "string | number | undefined",
      "string | undefined",
    ]);

    if (!(await database.has(defaultTable, args[0]))) {
      error.errorVar(args[0], "$setVar");
      return;
    }

    await database.set(
      defaultTable,
      `user_${args[2] || userId}_${chatId}_${args[0]}`,
      args[1],
    );
  },
};
