export default {
  name: "$updateCommands",
  callback: async (ctx, event, database, error) => {
    const [debug = false] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([debug], error, ["boolean"]);
    try {
      const commandsPath = event.telegram.loadCommands?.path;
      if (!commandsPath) return false;
      event.telegram.loadCommands.loadCommands(commandsPath, debug, true);
      return true;
    } catch (error) {
      return false;
    }
  },
};
