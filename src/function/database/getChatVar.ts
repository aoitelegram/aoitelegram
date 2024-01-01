export default {
  name: "$getChatVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$getChatVar");
    const args = await ctx.getEvaluateArgs();
    const chatId = args[1] || event.chat?.id || event.message?.chat.id;
    const defaultTable = args[2] || database.tables[0];
    ctx.checkArgumentTypes(args, error, [
      "string",
      "string | number",
      "string | undefined",
    ]);

    if (!database.has(defaultTable, args[0])) {
      error.errorVar(args[0], "$getChatVar");
      return;
    }

    return database.get(defaultTable, `chat_${chatId}_${args[0]}`);
  },
};
