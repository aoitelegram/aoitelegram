export default {
  name: "$deleteVar",
  callback: (context) => {
    context.argsCheck(1);
    context.checkArgumentTypes([
      "unknown",
      "boolean | undefined",
      "string | undefined",
    ]);
    if (context.isError) return;

    const [
      variable,
      returnValue = false,
      defaultTable = context.database.tables[0],
    ] = context.splits;

    if (!context.database.hasTable(defaultTable)) {
      context.sendError(`Invalid table ${defaultTable} not found`);
      return;
    }

    return context.database.delete(defaultTable, variable, returnValue);
  },
};
