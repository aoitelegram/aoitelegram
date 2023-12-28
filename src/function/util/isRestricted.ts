export default {
  name: "$isRestricted",
  callback: async (ctx, event, database, error) => {
    const [userId = event.from?.id || event.message?.from.id] =
      await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([userId], error, ["string | number | undefined"]);
    const getPerms = await event.getChatMember(userId).catch(() => null);

    if (!getPerms || !getPerms?.status) {
      error.customError("Invalid User Id", "$isRestricted");
      return;
    }

    return getPerms.status === "restricted";
  },
};
