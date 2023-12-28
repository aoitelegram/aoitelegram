import { getObjectKey } from "../parser";

export default {
  name: "$getChatMember",
  callback: async (ctx, event, database, error) => {
    const [userId = event.from?.id || event.message?.from.id, path] =
      await ctx.getEvaluateArgs();
    const result = await event.telegram.getChatMember(userId).catch(() => null);

    if (!result) {
      error.customError("Invalid User Id", "$getChatMember");
      return;
    }

    return path ? getObjectKey(result, path) : result;
  },
};
