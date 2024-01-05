export default {
  name: "$resetUserVar",
  callback: (context) => {
    context.argsCheck(1);
    const [
      variable,
      chatId = context.event.chat?.id || context.event.message?.chat.id,
      defaultTable = context.database.tables[0],
    ] = context.splits;

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

    const allUsers = context.database.all(defaultTable);
    let affectedUserIds: string[] = [];

    for (const variableKey in allUsers) {
      const variableValue = context.database.get(defaultTable, variableKey);
      const [, userId] = variableKey.split("_");

      if (`user_${userId}_${chatId}_${variable}` !== variableKey) continue;

      affectedUserIds.push(userId);
    }

    for (const userId of affectedUserIds) {
      const defaultValue = context.database.defaultValue(
        variable,
        defaultTable,
      );
      const userVariableKey = `user_${userId}_${chatId}_${variable}`;
      context.database.set(defaultTable, userVariableKey, defaultValue);
    }

    return affectedUserIds.length;
  },
};
