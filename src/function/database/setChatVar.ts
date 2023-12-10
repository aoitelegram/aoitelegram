export default {
  name: "$setChatVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$setChatVar");
    const args = await ctx.getEvaluateArgs();
    const chatId = event.chat?.id || event.message?.chat.id;
    const defaultTable = args[3] || database.table[0];
    ctx.checkArgumentTypes(args, error, [
      "string",
      "unknown",
      "string | number | undefined",
      "string | undefined",
    ]);

    if (!(await database.has(defaultTable, args[0]))) {
      error.errorVar(args[0], "$setChatVar");
      return;
    }

    await database.set(
      defaultTable,
      `chat_${args[2] || chatId}_${args[0]}`,
      args[1],
    );
  },
};
