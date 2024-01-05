export default {
  name: "$hasClientPerms",
  callback: async (context) => {
    context.argsCheck(1);
    const [perms] = context.splits;
    context.checkArgumentTypes(["string"]);
    if (context.isError) return;

    const getMe = await context.telegram.getMe();
    const getPerms = await context.getChatMember(getMe.id).catch((err) => null);
    return getPerms ? getPerms[perms] : false;
  },
};
