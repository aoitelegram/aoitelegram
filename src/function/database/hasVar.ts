export default {
  name: "$hasVar",
  callback: (context) => {
    context.argsCheck(1);
    const [variable, defaultTable = context.database.tables[0]] =
      context.splits;

    if (!context.database.hasTable(defaultTable)) {
      context.sendError(`Invalid table ${defaultTable} not found`);
      return;
    }
    return context.database.has(defaultTable, variable);
  },
};
