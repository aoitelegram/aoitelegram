export default {
  name: "$hasClientPerms",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$hasClientPerms");
    const [perms] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([perms], error, ["string"]);
    const getMe = await event.telegram.getMe();
    const getPerms =
      (await event.getChatMember(getMe.id).catch((err) => console.log(err))) ||
      {};
    return getPerms[perms] || false;
  },
};
