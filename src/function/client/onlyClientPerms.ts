export default {
  name: "$onlyClientPerms",
  callback: async (context) => {
    context.argsCheck(1);
    const [perms, messageError] = context.splits;
    context.checkArgumentTypes(["string", "string | undefined"]);
    if (context.isError) return;

    const getMe = await context.telegram.getMe();
    const getPerms = await context.getChatMember(getMe.id);

    const result = !getPerms[perms];
    if (result) {
      if (messageError) {
        context.sendError(messageError, true);
      } else context.isError = true;
    }
  },
};
