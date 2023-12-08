import ms from "ms";
import { formatTime, replaceData } from "../parser";

export default {
  name: "$chatCooldown",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error);
    const args = await ctx.getEvaluateArgs();
    const chatId = event.chat?.id || event.message?.chat.id;
    const defaultTable = args[5] || database.table[0];
    ctx.checkArgumentTypes(args, error, ["string", "string"]);

    const cooldownKey = `${chatId}_${ms(args[0])}`;
    const userCooldown = (await database.get(defaultTable, cooldownKey)) || 0;
    const cooldown = userCooldown + +ms(args[0]) - Date.now();
    if (cooldown > 0) {
      if (ctx.replyMessage)
        event.reply(replaceData(formatTime(cooldown).units, args[1]));
      else event.send(replaceData(formatTime(cooldown).units, args[1]));
      return true;
    } else {
      await database.set(defaultTable, cooldownKey, Date.now());
    }
  },
};
