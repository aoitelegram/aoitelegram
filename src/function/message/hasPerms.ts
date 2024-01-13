export default {
  name: "$hasPerms",
  callback: async (context) => {
    context.argsCheck(1);
    const [
      perms,
      userId = context.event.from?.id || context.event.message?.from.id,
    ] = context.splits;
    context.checkArgumentTypes(["string", "string | number | undefined"]);
    if (context.isError) return;

    const getPerms = await context.event.getChatMember(userId);

    const hasCreator =
      getPerms.status === "creator" || getPerms.status === "left";
    return hasCreator || getPerms[perms] || false;
  },
};
