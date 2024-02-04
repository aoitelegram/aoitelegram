export default {
  name: "$ping",
  callback: async (context) => {
    if (context.isError) return;
    if (context.inside == "client" || !context.inside) {
      return await context.telegram.ping();
    } else if (context.inside == "db") {
      const now = Date.now();
      const tables = await context.database.tables;
      const database = await tables.forEach(
        async (table) => await context.database.all(table),
      );
      return Date.now() - now;
    }
  },
};
