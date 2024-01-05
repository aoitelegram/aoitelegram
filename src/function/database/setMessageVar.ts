export default {
  name: "$setMessageVar",
  callback: (context) => {
    context.argsCheck(2);
    const [
      variable,
      value,
      messageId = context.event.message_id || context.event.message?.message_id,
      defaultTable = context.database.tables[0],
    ] = context.splits;

    const chatId = context.event.chat?.id || context.event.message?.chat.id;

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

    context.database.set(
      defaultTable,
      `message_${messageId}_${chatId}_${variable}`,
      value,
    );
  },
};
