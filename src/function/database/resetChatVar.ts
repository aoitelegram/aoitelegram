export default {
  name: "$resetChatVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$resetChatVar");
    const args = await ctx.getEvaluateArgs();
    const chatId = event.chat?.id || event.message?.chat.id;
    const defaultTable = args[2] || database.table[0];
    ctx.checkArgumentTypes(args, error, [
      "string",
      "string | number | undefined",
      "string | undefined",
    ]);

    const variableName = args[0];

    if (!(await database.has(defaultTable, variableName))) {
      error.errorVar(variableName, "$resetChatVar");
      return;
    }

    const allChats = await database.all(defaultTable);
    let affectedChatIds: string[] = [];

    for (const variableKey in allChats) {
      const variableValue = await database.get(defaultTable, variableKey);
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
      await database.set(defaultTable, chatVariableKey, defaultValue);
    }

    return affectedChatIds.length;
  },
};
