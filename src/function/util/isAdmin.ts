export default {
  name: "$isAdmin",
  callback: async (context) => {
    const [userId = context.event.from?.id || context.event.message?.from.id] =
      context.splits;
    const getPerms = await context.event
      .getChatMember(userId)
      .catch(() => null);

    if (!getPerms || !getPerms?.status) {
      context.sendError("Invalid User Id");
      return;
    }

    return getPerms.status === "administrator";
  },
};
