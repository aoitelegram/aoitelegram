export default {
  name: "$onlyChatPerms",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$onlyChatPerms");
    const [perms, messageError] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([perms, messageError], error, ["string", "string"]);
    const getPerms = await event.getChat().catch(() => null);

    if (!getPerms || !getPerms.permissions) {
      error.customError("Invalid Chat Id", "$onlyChatPerms");
      return;
    }

    const result = !getPerms.permissions?.[perms];
    if (result) {
      if (ctx.replyMessage) event.reply(messageError);
      else event.send(messageError);
      return true;
    } else return false;
  },
};
