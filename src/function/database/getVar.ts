export default {
  name: "$getVar",
  callback: (context) => {
    context.argsCheck(1);
    const [variable, defaultTable = context.database.tables[0]] =
      context.splits;

    if (context.isError) return;

    if (!context.database.hasTable(defaultTable)) {
      context.sendError(`Invalid table ${defaultTable} not found`);
      return;
    }

    return context.database.get(defaultTable, variable);
  },
};
