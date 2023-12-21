export default {
  name: "$onlyClientPerms",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$onlyClientPerms");
    const [perms, messageError] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([perms, messageError], error, [
      "string",
      "string | undefined",
    ]);
    const getMe = await event.telegram.getMe();
    const getPerms = await event
      .getChatMember(getMe.id)
      .catch((err) => console.log(err));
    const result = !getPerms[perms];
    if (result) {
      if (!!messageError) {
        if (ctx.replyMessage) event.reply(messageError);
        else event.send(messageError);
        return true;
      } else return true;
    } else return false;
  },
};
