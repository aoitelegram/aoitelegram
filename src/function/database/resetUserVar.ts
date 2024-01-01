export default {
  name: "$resetUserVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$resetUserVar");
    const args = await ctx.getEvaluateArgs();
    const chatId = args[1] || event.chat?.id || event.message?.chat.id;
    const defaultTable = args[2] || database.tables[0];
    ctx.checkArgumentTypes(args, error, [
      "string",
      "string | number | undefined",
      "string | undefined",
    ]);

    const variableName = args[0];

    if (!database.has(defaultTable, variableName)) {
      error.errorVar(variableName, "$resetUserVar");
      return;
    }

    const allUsers = database.all(defaultTable);
    let affectedUserIds: string[] = [];

    for (const variableKey in allUsers) {
      const variableValue = database.get(defaultTable, variableKey);
      const [, userId] = variableKey.split("_");

      if (`user_${userId}_${chatId}_${variableName}` !== variableKey) continue;

      affectedUserIds.push(userId);
    }

    for (const userId of affectedUserIds) {
      const defaultValue = await database.defaultValue(
        variableName,
        defaultTable,
      );
      const userVariableKey = `user_${userId}_${chatId}_${variableName}`;
      database.set(defaultTable, userVariableKey, defaultValue);
    }

    return affectedUserIds.length;
  },
};
