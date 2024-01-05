export default {
  name: "$hasChatPerms",
  callback: async (context) => {
    context.argsCheck(1);
    const perms = context.inside;
    context.checkArgumentTypes(["string"]);
    if (context.isError) return;

    const getPerms = await context.event.getChat().catch(() => null);

    if (!getPerms || !getPerms?.permissions) {
      context.sendError("Invalid Chat Id");
      return;
    }

    return getPerms.permissions[perms] || false;
  },
};
