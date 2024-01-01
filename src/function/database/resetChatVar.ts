export default {
  name: "$resetChatVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$resetChatVar");
    const args = await ctx.getEvaluateArgs();
    const defaultTable = args[1] || database.tables[0];
    ctx.checkArgumentTypes(args, error, ["string", "string | undefined"]);

    const variableName = args[0];

    if (!database.has(defaultTable, variableName)) {
      error.errorVar(variableName, "$resetChatVar");
      return;
    }

    const allChats = database.all(defaultTable);
    let affectedChatIds: string[] = [];

    for (const variableKey in allChats) {
      const variableValue = database.get(defaultTable, variableKey);
      const [, chatId] = variableKey.split("_");

      if (`chat_${chatId}_${variableName}` !== variableKey) continue;

      affectedChatIds.push(chatId);
    }

    for (const chatId of affectedChatIds) {
      const defaultValue = await database.defaultValue(
        variableName,
        defaultTable,
      );
      const chatVariableKey = `chat_${chatId}_${variableName}`;
      database.set(defaultTable, chatVariableKey, defaultValue);
    }

    return affectedChatIds.length;
  },
};
