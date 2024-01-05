import { getObjectKey } from "../parser";

export default {
  name: "$getChatMember",
  callback: async (context) => {
    const [
      userId = context.event.from?.id || context.event.message?.from.id,
      path,
    ] = context.splits;
    const result = await context.telegram
      .getChatMember(userId)
      .catch(() => null);

    if (!result) {
      context.sendError("Invalid User Id");
      return;
    }

    return path ? getObjectKey(result, path) : result;
  },
};
