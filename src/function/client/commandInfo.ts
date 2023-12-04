export default {
  name: "$commandInfo",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const args = await ctx.getEvaluateArgs();
    const commands = event.telegram?.commands.get({ name: args[0] });
    return commands?.[args[1] ?? "code"];
  },
};
