export default {
  name: "$setChatVar",
  callback: (context) => {
    context.argsCheck(2);
    const [
      variable,
      value,
      chatId = context.event.chat?.id || context.event.message?.chat.id,
      defaultTable = context.database.tables[0],
    ] = context.splits;

    context.checkArgumentTypes([
      "string",
      "unknown",
      "string | number | undefined",
      "string | undefined",
    ]);

    if (context.isError) return;

    if (!context.database.has(defaultTable, variable)) {
      context.sendError(`Invalid variable ${variable} not found`);
      return;
    }

    context.database.set(defaultTable, `chat_${chatId}_${variable}`, value);
  },
};
