export default {
  name: "$getMessageVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$getMessageVar");
    const args = await ctx.getEvaluateArgs();
    const messageId = event.message_id || event.message?.message_id;
    const chatId = event.chat?.id || event.message?.chat.id;
    const defaultTable = args[2] || database.table[0];
    ctx.checkArgumentTypes(args, error, [
      "string",
      "string | number",
      "string | undefined",
    ]);

    if (!(await database.has(defaultTable, args[0]))) {
      error.errorVar(args[0], "$getMessageVar");
      return;
    }

    return await database.get(
      defaultTable,
      `message_${args[1] || messageId}_${chatId}_${args[0]}`,
    );
  },
};
