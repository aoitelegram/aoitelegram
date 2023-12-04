export default {
  name: "$commandName",
  callback: async (ctx, event, database, error) => {
    return ctx.fileName && ctx.type === "command" ? ctx.fileName : undefined;
  },
};
