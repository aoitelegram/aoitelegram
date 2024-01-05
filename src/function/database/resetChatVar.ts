export default {
  name: "$resetChatVar",
  callback: (context) => {
    context.argsCheck(1);
    const [variable, defaultTable = context.database.tables[0]] =
      context.splits;

    context.checkArgumentTypes(["string", "string | undefined"]);

    if (context.isError) return;

    if (!context.database.has(defaultTable, variable)) {
      context.sendError(`Invalid variable ${variable} not found`);
      return;
    }

    const allChats = context.database.all(defaultTable);
    let affectedChatIds: string[] = [];

    for (const variableKey in allChats) {
      const variableValue = context.database.get(defaultTable, variableKey);
      const [, chatId] = variableKey.split("_");

      if (`chat_${chatId}_${variable}` !== variableKey) continue;

      affectedChatIds.push(chatId);
    }

    for (const chatId of affectedChatIds) {
      const defaultValue = context.database.defaultValue(
        variable,
        defaultTable,
      );
      const chatVariableKey = `chat_${chatId}_${variable}`;
      context.database.set(defaultTable, chatVariableKey, defaultValue);
    }

    return affectedChatIds.length;
  },
};
