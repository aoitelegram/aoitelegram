import { arrayAt } from "../parser";

export default {
  name: "$onlyIfMessageContains",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$onlyIfMessageContains");
    const [text, ...chars] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([text, chars], error, ["string", "...unknown"]);
    const result = chars.some((search) => text.includes(search));
    const messageError = arrayAt(chars, -1);
    if (!result) {
      if (!!messageError) {
        if (ctx.replyMessage) event.reply(messageError);
        else event.send(messageError);
        return true;
      } else return true;
    } else return false;
  },
};
