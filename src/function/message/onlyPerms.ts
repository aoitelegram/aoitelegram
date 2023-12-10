export default {
  name: "$onlyPerms",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$onlyPerms");
    const [
      perms,
      messageError,
      userId = event.from?.id || event.message?.from.id,
    ] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([perms, messageError, userId], error, [
      "string",
      "string | undefined",
      "string | number | undefined",
    ]);
    const getPerms = await event.getChatMember(userId);
    const hasAdministrator = getPerms.status === "administrator";
    const hasCreator = getPerms.status === "creator";
    const result = hasCreator || hasAdministrator || getPerms[perms] || false;
    if (!result) {
      if (!!messageError) {
        if (ctx.replyMessage) event.reply(messageError);
        else event.send(messageError);
        return true;
      } else return true;
    } else return false;
  },
};
