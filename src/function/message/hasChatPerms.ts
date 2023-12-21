export default {
  name: "$hasChatPerms",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$hasChatPerms");
    const [perms] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([perms], error, ["string"]);
    const getPerms =
      (await event.getChat().catch((err) => console.log(err))) || {};
    return getPerms.permissions?.[perms] || false;
  },
};
