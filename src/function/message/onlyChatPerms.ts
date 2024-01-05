export default {
  name: "$onlyChatPerms",
  callback: async (context) => {
    context.argsCheck(1);
    const [perms, messageError] = context.splits;
    context.checkArgumentTypes(["string", "string | undefined"]);
    if (context.isError) return;

    const getPerms = await context.event.getChat().catch(() => null);

    if (!getPerms || !getPerms.permissions) {
      context.sendError("Invalid Chat Id");
      return;
    }

    const result = !getPerms.permissions?.[perms];
    if (result) {
      if (messageError) {
        context.sendError(messageError, true);
      } else context.isError = true;
    }
  },
};
