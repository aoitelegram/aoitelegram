export default {
  name: "$hasChatPerms",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$hasChatPerms");
    const [perms] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([perms], error, ["string"]);
    const getPerms = await event.getChat().catch(() => null);

    if (!getPerms || !getPerms?.permissions) {
      error.customError("Invalid Chat Id", "$hasChatPerms");
      return;
    }

    return getPerms.permissions[perms] || false;
  },
};
