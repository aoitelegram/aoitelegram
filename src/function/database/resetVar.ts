export default {
  name: "$resetVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$resetVar");
    const args = await ctx.getEvaluateArgs();
    const defaultTable = args[1] || database.tables[0];
    ctx.checkArgumentTypes(args, error, ["string", "string | undefined"]);

    const variableName = args[0];

    if (!database.has(defaultTable, variableName)) {
      error.errorVar(variableName, "$resetVar");
      return;
    }

    const all = database.all(defaultTable);
    let affectedIds: string[] = [];

    for (const variableKey in all) {
      const [key] = variableKey.split("_");

      if (variableKey !== variableName) continue;
      affectedIds.push(key);

      const defaultValue = await database.defaultValue(key, defaultTable);
      database.set(defaultTable, key, defaultValue);
    }

    return affectedIds.length;
  },
};
