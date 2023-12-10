import { arrayAt } from "../parser";

export default {
  name: "$onlyForIDs",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$onlyForIDs");
    const [...IDs] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([IDs], error, ["...number | ...string"]);
    const userId = event.from?.id || event.message?.from.id;
    const result = IDs.some((search) => search === userId);
    const messageError = arrayAt(IDs, -1);
    if (!result) {
      if (!!messageError) {
        if (ctx.replyMessage) event.reply(messageError);
        else event.send(messageError);
        return true;
      } else return true;
    } else return false;
  },
};
