export default {
  name: "$setVar",
  callback: (context) => {
    context.argsCheck(2);
    const [variable, value, defaultTable = context.database.tables[0]] =
      context.splits;

    if (context.isError) return;

    if (!context.database.has(defaultTable, variable)) {
      context.sendError(`Invalid variable ${variable} not found`);
      return;
    }

    if (!context.database.hasTable(defaultTable)) {
      context.sendError(`Invalid table ${defaultTable} not found`);
      return;
    }

    return context.database.set(defaultTable, variable, value);
  },
};
