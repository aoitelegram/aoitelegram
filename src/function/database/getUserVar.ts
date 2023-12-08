export default {
  name: "$getUserVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const args = await ctx.getEvaluateArgs();
    const userId = event.from?.id || event.message?.from.id;
    const chatId = event.chat?.id || event.message?.chat.id;
    const defaultTable = args[2] || database.table[0];
    ctx.checkArgumentTypes(args, error, [
      "string",
      "string | number",
      "string | undefined",
    ]);

    if (!(await database.has(defaultTable, args[0]))) {
      error.errorVar(args[0], "$setVar");
      return;
    }

    return await database.get(
      defaultTable,
      `user_${args[1] || userId}_${chatId}_${args[0]}`,
    );
  },
};
