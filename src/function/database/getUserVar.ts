export default {
  name: "$getUserVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$getUserVar");
    const args = await ctx.getEvaluateArgs();
    const userId = event.from?.id || event.message?.from.id;
    const chatId = event.chat?.id || event.message?.chat.id;
    const defaultTable = args[2] || database.tables[0];
    ctx.checkArgumentTypes(args, error, [
      "string",
      "string | number",
      "string | undefined",
    ]);

    if (!database.has(defaultTable, args[0])) {
      error.errorVar(args[0], "$getUserVar");
      return;
    }

    return await database.get(
      defaultTable,
      `user_${args[1] || userId}_${chatId}_${args[0]}`,
    );
  },
};
