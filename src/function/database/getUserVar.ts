import { hasChatPrivate } from "../helpers";

export default {
  name: "$getUserVar",
  callback: async (context) => {
    context.argsCheck(1);
    const [
      variable,
      userId = context.event.from?.id || context.event.message?.from.id,
      defaultTable = context.database.tables[0],
    ] = context.splits;

    const chatId = context.event.chat?.id || context.event.message?.chat.id;

    context.checkArgumentTypes([
      "string",
      "string | number | undefined",
      "string | undefined",
    ]);

    if (context.isError) return;

    if (!context.database.has(defaultTable, variable)) {
      context.sendError(`Invalid variable ${variable} not found`);
      return;
    }

    if (!(await hasChatPrivate(context.event, userId))) {
      context.sendError("Invalid User Id");
      return;
    }

    return context.database.get(
      defaultTable,
      `user_${userId}_${chatId}_${variable}`,
    );
  },
};
