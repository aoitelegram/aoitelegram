export default {
  name: "$getChatVar",
  callback: (context) => {
    context.argsCheck(1);
    const [
      variable,
      chatId = context.event.chat?.id || context.event.message?.chat.id,
      defaultTable = context.database.tables[0],
    ] = context.splits;

    context.checkArgumentTypes([
      "string",
      "string | number",
      "string | undefined",
    ]);

    if (context.isError) return;

    if (!context.database.has(defaultTable, variable)) {
      context.sendError(`Invalid variable ${variable} not found`);
      return;
    }

    return context.database.get(defaultTable, `chat_${chatId}_${variable}`);
  },
};
