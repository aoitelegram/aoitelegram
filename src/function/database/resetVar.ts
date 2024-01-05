export default {
  name: "$resetVar",
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

    const all = context.database.all(defaultTable);
    let affectedIds: string[] = [];

    for (const variableKey in all) {
      const [key] = variableKey.split("_");

      if (variableKey !== variable) continue;
      affectedIds.push(key);

      const defaultValue = context.database.defaultValue(key, defaultTable);
      context.database.set(defaultTable, key, defaultValue);
    }

    return affectedIds.length;
  },
};
