export default {
  name: "$onlyPerms",
  callback: async (context) => {
    context.argsCheck(1);
    const [
      perms,
      messageError,
      userId = context.event.from?.id || context.event.message?.from.id,
    ] = context.splits;
    context.checkArgumentTypes([
      "string",
      "string | undefined",
      "string | number | undefined",
    ]);
    if (context.isError) return;

    const getPerms = await context.event
      .getChatMember(userId)
      .catch(() => null);

    if (!getPerms) {
      context.sendError("Invalid User Id");
      return;
    }

    const hasCreator =
      getPerms.status === "creator" || getPerms.status === "left";
    const result = hasCreator || getPerms[perms] || false;
    if (!result) {
      if (messageError) {
        context.sendError(messageError, true);
      } else context.isError = true;
    }
  },
};
