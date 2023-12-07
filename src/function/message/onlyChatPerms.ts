export default {
  name: "$onlyChatPerms",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error);
    const [perms, messageError] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([perms, messageError], error, ["string", "string"]);
    const getPerms = await event.getChat();
    const result = !getPerms.permissions?.[perms];
    if (result) {
      if (ctx.replyMessage) event.reply(messageError);
      else event.send(messageError);
      return true;
    } else return false;
  },
};
