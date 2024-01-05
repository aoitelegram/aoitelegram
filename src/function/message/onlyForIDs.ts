import { arrayAt } from "../parser";

export default {
  name: "$onlyForIDs",
  callback: (context) => {
    context.argsCheck(1);
    const [...IDs] = context.splits;
    context.checkArgumentTypes(["...number | ...string"]);
    if (context.isError) return;

    const userId = context.event.from?.id || context.event.message?.from.id;
    const result = IDs.some((search) => search == userId);

    const messageError = arrayAt(IDs, -1);

    if (!result) {
      if (messageError) {
        context.sendError(messageError, true);
      } else context.isError = true;
    }
  },
};
