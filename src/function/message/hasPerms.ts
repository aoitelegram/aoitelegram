export default {
  name: "$hasPerms",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$hasPerms");
    const [perms, userId = event.from?.id || event.message?.from.id] =
      await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([perms, userId], error, [
      "string",
      "string | number | undefined",
    ]);
    const getPerms = await event.getChatMember(userId).catch(() => null);

    if (!getPerms) {
      error.customError("Invalid User Id", "$hasPerms");
      return;
    }

    const hasCreator =
      getPerms.status === "creator" || getPerms.status === "left";
    return hasCreator || getPerms[perms] || false;
  },
};
