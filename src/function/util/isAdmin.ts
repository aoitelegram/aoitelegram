export default {
  name: "$isAdmin",
  callback: async (ctx, event, database, error) => {
    const [userId = event.from?.id || event.message?.from.id] =
      await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([userId], error, ["string | number | undefined"]);
    const getPerms =
      (await event.getChatMember(userId).catch((err) => console.log(err))) ||
      {};
    return getPerms.status === "administrator";
  },
};
