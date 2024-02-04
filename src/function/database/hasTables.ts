export default {
  name: "$hasTables",
  callback: (context) => {
    context.argsCheck(1);
    const inside = context.inside;
    if (context.isError) return;

    const findIndex = context.database.tables.findIndex(
      (table) => table == inside,
    );
    return findIndex !== -1;
  },
};
