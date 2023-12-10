export default {
  name: "$resetVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$resetVar");
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
      error.errorVar(variableName, "$resetVar");
      return;
    }

    const all = await database.all(defaultTable);
    let affectedIds: string[] = [];

    for (const variableKey in all) {
      const [key] = variableKey.split("_");

      if (variableKey !== variableName) continue;
      affectedIds.push(key);

      const defaultValue = await database.defaultValue(key, defaultTable);
      await database.set(defaultTable, key, defaultValue);
    }

    return affectedIds.length;
  },
};
